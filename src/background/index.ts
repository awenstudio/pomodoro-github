/* ─────────────────────────────────────────────────────
 *  Background Service Worker
 *
 *  CRITICAL FIX: Uses chrome.alarms for tick instead
 *  of setInterval, because MV3 Service Workers are
 *  terminated after ~30s of inactivity. Alarms persist
 *  across SW restarts.
 * ───────────────────────────────────────────────────── */

import type {
  TimerState,
  TimerSession,
  DailyStats,
  MessageType,
  MessageResponse,
  Settings,
} from '@/types';
import type { Pet, PetSpecies, PetPersonality } from '@/lib/pet-system';
import { STAGE_XP_REQUIREMENTS } from '@/lib/pet-system';
import { executeInteraction, applyStatDecay, applyIdleDecay, type CooldownState } from '@/lib/pet-interaction';
import { calculateCoins, addCoins, loadCoins } from '@/lib/store';
import { createInitialState, timerReducer } from '@/lib/timer-engine';
import {
  loadTimerState,
  saveTimerState,
  loadSettings,
  addSession,
  updateDailyStats,
  updateStreak,
  updateProgress,
  loadProgress,
  loadAllData,
  createEmptyDailyStats,
  loadDailyStats,
  loadPet,
  savePet,
} from '@/lib/storage';
import {
  calculateSessionXP,
  getDailyTaskBonus,
  getStreakBonus,
  applyDailyCap,
  getLevelFromXP,
  getMaxForgivenessCards,
} from '@/lib/gamification';
import { showNotification } from '@/lib/notifications';
import { performDriveSync } from '@/lib/google-drive-sync';
import { SYNC_ALARM_NAME } from '@/lib/constants';

/* ── Constants ─────────────────────────────────────── */

const TICK_ALARM = 'pomodoro-tick';

/* ── State ─────────────────────────────────────────── */

let currentState: TimerState | null = null;
let cachedSettings: Settings | null = null;

/* ── Initialization ────────────────────────────────── */

chrome.runtime.onInstalled.addListener(async () => {
  cachedSettings = await loadSettings();
  currentState = await loadTimerState();
  if (!currentState) {
    currentState = createInitialState(cachedSettings);
    await saveTimerState(currentState);
  }
  updateBadge(currentState);
  scheduleSyncAlarm(cachedSettings);
});

chrome.runtime.onStartup.addListener(async () => {
  cachedSettings = await loadSettings();
  currentState = await loadTimerState();
  if (!currentState) {
    currentState = createInitialState(cachedSettings);
    await saveTimerState(currentState);
  }

  // If timer was running before shutdown, restore tick alarm
  if (currentState.status === 'running') {
    await chrome.alarms.create(TICK_ALARM, { periodInMinutes: 1 / 60 }); // ~1s
  } else if (currentState.status === 'paused') {
    // Keep as paused — no alarm needed
  }

  updateBadge(currentState);
  scheduleSyncAlarm(cachedSettings);
});

/* ── Alarm-based Tick (CRITICAL: survives SW restart) ── */

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === TICK_ALARM) {
    await handleTick();
  } else if (alarm.name === SYNC_ALARM_NAME) {
    try {
      await performDriveSync();
    } catch {
      // Sync errors are logged in sync state
    }
  }
});

async function handleTick(): Promise<void> {
  if (!currentState || currentState.status !== 'running') {
    await chrome.alarms.clear(TICK_ALARM);
    return;
  }

  if (!cachedSettings) cachedSettings = await loadSettings();
  const result = timerReducer(currentState, { type: 'TICK' }, cachedSettings);
  currentState = result.state;
  await saveTimerState(currentState);
  updateBadge(currentState);

  // Process effects
  for (const effect of result.effects) {
    switch (effect.type) {
      case 'SESSION_COMPLETE': {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const sessionDuration = currentState?.totalTime || cachedSettings.workDuration;
        const session: TimerSession = {
          id: crypto.randomUUID(),
          type: effect.sessionType,
          startedAt: new Date(now.getTime() - sessionDuration * 1000).toISOString(),
          endedAt: now.toISOString(),
          duration: sessionDuration,
          elapsed: sessionDuration,
          completed: true,
          interrupted: false,
          task: currentState?.currentTask || null,
        };

        await addSession(session);
        await updateDailyStats(dateStr, (current: DailyStats) => {
          const isWork = effect.sessionType === 'work';
          return {
            ...current,
            sessions: [...current.sessions, session],
            focusMinutes: current.focusMinutes + (isWork ? Math.round(session.elapsed / 60) : 0),
            breakMinutes: current.breakMinutes + (!isWork ? Math.round(session.elapsed / 60) : 0),
            completedPomodoros: current.completedPomodoros + (isWork ? 1 : 0),
          };
        });

        if (effect.sessionType === 'work') {
          const newStreak = await updateStreak(dateStr);

          // ── XP & Level System ──
          const todayStr = new Date().toISOString().split('T')[0];
          const todayStats = await loadDailyStats();
          const pomodorosToday = todayStats[dateStr]?.completedPomodoros || 0;
          const durationMin = Math.round(sessionDuration / 60);
          const currentProgress = await loadProgress();

          // Reset daily XP if new day
          const dailyXP = currentProgress.dailyXPDate === todayStr ? currentProgress.dailyXP : 0;

          // Calculate XP
          let xp = calculateSessionXP(durationMin, pomodorosToday, durationMin >= 50);
          const taskBonus = pomodorosToday >= 3 ? getDailyTaskBonus(pomodorosToday + 1) : 0;
          const streakBonus = getStreakBonus(newStreak.current);
          const isNewStreakBonus = newStreak.current > currentProgress.lastBonusStreak &&
            [7, 14, 21, 30].includes(newStreak.current);
          xp += taskBonus + (isNewStreakBonus ? streakBonus : 0);
          xp = applyDailyCap(xp, dailyXP);

          const newTotal = currentProgress.totalXP + xp;
          const levelInfo = getLevelFromXP(newTotal);

          await updateProgress((prog) => ({
            ...prog,
            totalXP: newTotal,
            level: levelInfo.level,
            dailyXP: dailyXP + xp,
            dailyXPDate: todayStr,
            lastBonusStreak: isNewStreakBonus ? newStreak.current : prog.lastBonusStreak,
            forgivenessCardsDate: prog.forgivenessCardsDate === todayStr ? prog.forgivenessCardsDate : todayStr,
            forgivenessCardsUsed: prog.forgivenessCardsDate === todayStr ? prog.forgivenessCardsUsed : 0,
          }));

          // ── Coin rewards ──
          const coinsEarned = calculateCoins(levelInfo.level, newStreak.current);
          await addCoins(coinsEarned);

          // ── Pet rewards ──
          const pet = await loadPet();
          if (pet) {
            const xpGain = durationMin;
            const foodGain = Math.floor(durationMin / 10); // 1 food per 10 min
            const newPetXP = pet.xp + xpGain;

            // Check for stage evolution
            let newStage = pet.stage;
            for (const stage of ['baby', 'child', 'teen', 'adult', 'master', 'legend'] as const) {
              if (newPetXP >= STAGE_XP_REQUIREMENTS[stage]) {
                newStage = stage;
              }
            }

            const decayedPet = applyStatDecay(pet, durationMin);
            await savePet({
              ...decayedPet,
              xp: newPetXP,
              level: Math.floor(newPetXP / 100) + 1,
              stage: newStage,
              food: decayedPet.food + foodGain,
              affinity: Math.min(10000, decayedPet.affinity + xpGain),
              totalFocusMinutes: decayedPet.totalFocusMinutes + durationMin,
              totalPomodoros: decayedPet.totalPomodoros + 1,
            });
          }
        }
        break;
      }

      case 'NOTIFY':
        await showNotification(effect.title, effect.body);
        break;
    }
  }

  // If timer completed, stop the alarm
  if (currentState.status !== 'running') {
    await chrome.alarms.clear(TICK_ALARM);
  }
}

function startTickAlarm(): void {
  // Chrome alarms minimum period is 1 minute for non-enterprise,
  // but we use periodInMinutes: 1/60 (~1s) which works in extensions
  chrome.alarms.create(TICK_ALARM, { periodInMinutes: 1 / 60 });
}

function stopTickAlarm(): void {
  chrome.alarms.clear(TICK_ALARM);
}

/* ── Sync Alarm ────────────────────────────────────── */

function scheduleSyncAlarm(settings: Settings): void {
  if (settings.autoSync && settings.googleUser) {
    chrome.alarms.create(SYNC_ALARM_NAME, {
      periodInMinutes: settings.syncIntervalMinutes,
    });
  }
}

/* ── Badge ─────────────────────────────────────────── */

function updateBadge(state: TimerState): void {
  const minutes = Math.floor(state.timeLeft / 60);
  const text = state.status === 'idle' ? '' : String(minutes);

  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({
    color: state.currentSessionType === 'work' ? '#ef4444' : '#22c55e',
  });
}

/* ── Message Handler ───────────────────────────────── */

chrome.runtime.onMessage.addListener(
  (msg: MessageType, _sender, sendResponse: (response: MessageResponse) => void) => {
    handleMessage(msg)
      .then(sendResponse)
      .catch((error: Error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // async
  },
);

async function handleMessage(msg: MessageType): Promise<MessageResponse> {
  if (!cachedSettings) cachedSettings = await loadSettings();

  if (!currentState) {
    currentState = (await loadTimerState()) || createInitialState(cachedSettings);
  }

  switch (msg.type) {
    case 'GET_STATE': {
      const data = await loadAllData();
      const progress = await loadProgress();
      let pet = await loadPet();

      // Apply idle decay when loading state
      if (pet) {
        const decayed = applyIdleDecay(pet);
        if (decayed.mood !== pet.mood || decayed.hunger !== pet.hunger) {
          await savePet(decayed);
          pet = decayed;
        }
      }

      return {
        success: true,
        data: {
          timer: currentState,
          settings: data.settings,
          todayStats: getTodayStats(data.dailyStats),
          streak: data.streak,
          syncState: data.syncState,
          progress,
          pet,
        },
      };
    }

    case 'USE_FORGIVENESS': {
      const todayStr = new Date().toISOString().split('T')[0];
      const prog = await loadProgress();
      const maxCards = getMaxForgivenessCards(prog.level);
      const usedToday = prog.forgivenessCardsDate === todayStr ? prog.forgivenessCardsUsed : 0;

      if (usedToday >= maxCards) {
        return { success: false, error: 'No forgiveness cards left today' };
      }

      await updateProgress((p) => ({
        ...p,
        forgivenessCardsUsed: usedToday + 1,
        forgivenessCardsDate: todayStr,
      }));

      // Mark current session as saved (not interrupted)
      if (currentState && currentState.status !== 'idle') {
        currentState = { ...currentState, status: 'idle' };
        await saveTimerState(currentState);
        updateBadge(currentState);
        stopTickAlarm();
      }

      return { success: true };
    }

    case 'START': {
      const result = timerReducer(currentState, { type: 'START' }, cachedSettings);
      currentState = {
        ...result.state,
        currentTask: msg.task || currentState.currentTask,
      };
      await saveTimerState(currentState);
      updateBadge(currentState);
      startTickAlarm();
      return { success: true, data: currentState };
    }

    case 'PAUSE': {
      const result = timerReducer(currentState, { type: 'PAUSE' }, cachedSettings);
      currentState = result.state;
      await saveTimerState(currentState);
      updateBadge(currentState);
      stopTickAlarm();
      return { success: true, data: currentState };
    }

    case 'RESUME': {
      const result = timerReducer(currentState, { type: 'RESUME' }, cachedSettings);
      currentState = result.state;
      await saveTimerState(currentState);
      updateBadge(currentState);
      startTickAlarm();
      return { success: true, data: currentState };
    }

    case 'SKIP': {
      if (currentState.status === 'running') {
        const elapsed = currentState.totalTime - currentState.timeLeft;
        if (elapsed > 10) {
          const session: TimerSession = {
            id: crypto.randomUUID(),
            type: currentState.currentSessionType,
            startedAt: new Date(Date.now() - elapsed * 1000).toISOString(),
            endedAt: new Date().toISOString(),
            duration: currentState.totalTime,
            elapsed,
            completed: false,
            interrupted: true,
            task: currentState.currentTask,
          };
          await addSession(session);
          const dateStr = new Date().toISOString().split('T')[0];
          await updateDailyStats(dateStr, (current: DailyStats) => ({
            ...current,
            sessions: [...current.sessions, session],
            interruptedPomodoros:
              current.interruptedPomodoros +
              (currentState!.currentSessionType === 'work' ? 1 : 0),
          }));
        }
      }

      stopTickAlarm();
      const result = timerReducer(currentState, { type: 'SKIP' }, cachedSettings);
      currentState = result.state;
      await saveTimerState(currentState);
      updateBadge(currentState);

      for (const effect of result.effects) {
        if (effect.type === 'NOTIFY') {
          await showNotification(effect.title, effect.body);
        }
      }

      return { success: true, data: currentState };
    }

    case 'RESET': {
      stopTickAlarm();
      if (currentState.status === 'running' || currentState.status === 'paused') {
        const elapsed = currentState.totalTime - currentState.timeLeft;
        if (elapsed > 10) {
          const session: TimerSession = {
            id: crypto.randomUUID(),
            type: currentState.currentSessionType,
            startedAt: new Date(Date.now() - elapsed * 1000).toISOString(),
            endedAt: new Date().toISOString(),
            duration: currentState.totalTime,
            elapsed,
            completed: false,
            interrupted: true,
            task: currentState.currentTask,
          };
          await addSession(session);
        }
      }

      const result = timerReducer(currentState, { type: 'RESET' }, cachedSettings);
      currentState = result.state;
      await saveTimerState(currentState);
      updateBadge(currentState);
      return { success: true, data: currentState };
    }

    case 'SWITCH_SESSION': {
      // Allow switching always - if running, pause first then switch
      if (currentState.status === 'running') {
        // Record elapsed time for interrupted session
        const elapsed = currentState.totalTime - currentState.timeLeft;
        if (elapsed > 10) {
          const session: TimerSession = {
            id: crypto.randomUUID(),
            type: currentState.currentSessionType,
            startedAt: new Date(Date.now() - elapsed * 1000).toISOString(),
            endedAt: new Date().toISOString(),
            duration: currentState.totalTime,
            elapsed,
            completed: false,
            interrupted: true,
            task: currentState.currentTask,
          };
          await addSession(session);
        }
        stopTickAlarm();
      }
      const result = timerReducer(currentState, { type: 'SWITCH_SESSION', sessionType: msg.sessionType }, cachedSettings);
      currentState = result.state;
      await saveTimerState(currentState);
      updateBadge(currentState);
      return { success: true, data: currentState };
    }

    case 'UPDATE_SETTINGS': {
      const { saveSettings: save } = await import('@/lib/storage');
      await save(msg.settings);
      cachedSettings = await loadSettings();
      if (currentState.status === 'idle') {
        const result = timerReducer(currentState, { type: 'RESET' }, cachedSettings);
        currentState = result.state;
        await saveTimerState(currentState);
        updateBadge(currentState);
      }
      return { success: true };
    }

    case 'SYNC_NOW': {
      const syncState = await performDriveSync();
      return { success: true, data: syncState };
    }

    case 'CREATE_PET': {
      const personalities: PetPersonality[] = ['lively', 'calm', 'tsundere', 'gentle', 'funny', 'genki', 'scholar'];
      const newPet: Pet = {
        id: crypto.randomUUID(),
        name: msg.name || 'Puppy',
        species: (msg.species as PetSpecies) || 'shiba',
        personality: personalities[Math.floor(Math.random() * personalities.length)],
        stage: 'egg',
        mood: 80,
        hunger: 80,
        affinity: 0,
        xp: 0,
        level: 1,
        coins: 0,
        food: 5,
        createdAt: new Date().toISOString(),
        lastFedAt: new Date().toISOString(),
        lastInteractedAt: new Date().toISOString(),
        totalFocusMinutes: 0,
        totalPomodoros: 0,
      };
      await savePet(newPet);
      return { success: true, data: newPet };
    }

    case 'FEED_PET':
    case 'PLAY_WITH_PET':
    case 'PET_PET': {
      const pet = await loadPet();
      if (!pet) return { success: false, error: 'No pet' };
      const interactionType = msg.type === 'FEED_PET' ? 'feed' : msg.type === 'PLAY_WITH_PET' ? 'play' : 'pet';

      // Load cooldowns from storage
      const stored = await chrome.storage.local.get('pomodoro_pet_cooldowns');
      const cooldowns: CooldownState = stored.pomodoro_pet_cooldowns || { feed: 0, play: 0, pet: 0 };

      const result = executeInteraction(pet, interactionType, cooldowns);
      if (!result.success) return { success: false, error: result.error };

      // Update cooldowns
      const newCooldowns = { ...cooldowns, [interactionType]: Date.now() + result.cooldownMs };
      await chrome.storage.local.set({ pomodoro_pet_cooldowns: newCooldowns });

      await savePet(result.pet);
      return { success: true, data: { pet: result.pet, reaction: result.reaction, statChanges: result.statChanges, cooldownMs: result.cooldownMs } };
    }

    case 'CLEAR_DATA': {
      const { clearAllData: clear } = await import('@/lib/storage');
      await clear();
      currentState = createInitialState(cachedSettings);
      await saveTimerState(currentState);
      updateBadge(currentState);
      stopTickAlarm();
      return { success: true };
    }

    case 'GET_COINS': {
      const coins = await loadCoins();
      return { success: true, data: coins };
    }

    case 'ADD_COINS': {
      const amount = (effect as { amount?: number }).amount || 0;
      const newBalance = await addCoins(amount);
      return { success: true, data: newBalance };
    }

    default:
      return { success: false, error: 'Unknown message type' };
  }
}

function getTodayStats(dailyStats: Record<string, DailyStats>): DailyStats {
  const today = new Date().toISOString().split('T')[0];
  return dailyStats[today] || createEmptyDailyStats(today);
}
