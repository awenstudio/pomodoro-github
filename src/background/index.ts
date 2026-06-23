/* ─────────────────────────────────────────────────────
 *  Background Service Worker
 *  Owns the real timer, handles alarms, records
 *  sessions, and manages sync scheduling.
 * ───────────────────────────────────────────────────── */

import type {
  TimerState,
  TimerSession,
  DailyStats,
  MessageType,
  MessageResponse,
  TaskRef,
  Settings,
} from '@/types';
import { createInitialState, timerReducer } from '@/lib/timer-engine';
import {
  loadTimerState,
  saveTimerState,
  loadSettings,
  addSession,
  updateDailyStats,
  updateStreak,
  loadAllData,
  createEmptyDailyStats,
} from '@/lib/storage';
import { showNotification } from '@/lib/notifications';
import { performSync } from '@/lib/github-sync';
import {
  ALARM_NAME,
  SYNC_ALARM_NAME,
} from '@/lib/constants';

/* ── State ─────────────────────────────────────────── */

let currentState: TimerState | null = null;
let tickInterval: ReturnType<typeof setInterval> | null = null;

/* ── Initialization ────────────────────────────────── */

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await loadSettings();
  currentState = await loadTimerState();
  if (!currentState) {
    currentState = createInitialState(settings);
    await saveTimerState(currentState);
  }
  updateBadge(currentState);
  scheduleSyncAlarm(settings);
});

chrome.runtime.onStartup.addListener(async () => {
  const settings = await loadSettings();
  currentState = await loadTimerState();
  if (!currentState) {
    currentState = createInitialState(settings);
    await saveTimerState(currentState);
  }

  // Check if timer was running before shutdown
  if (currentState.status === 'running') {
    // Timer was interrupted — mark as paused
    currentState = { ...currentState, status: 'paused' };
    await saveTimerState(currentState);
  }

  updateBadge(currentState);
  scheduleSyncAlarm(settings);
});

/* ── Alarm Management ──────────────────────────────── */

let cachedSettings: Settings | null = null;

function startTick(): void {
  stopTick();
  // Cache settings once per session to avoid per-tick storage reads
  loadSettings().then((s) => (cachedSettings = s));

  // Use setInterval for precise countdown (alarms have 30s minimum)
  tickInterval = setInterval(async () => {
    if (!currentState || currentState.status !== 'running') {
      stopTick();
      return;
    }

    if (!cachedSettings) cachedSettings = await loadSettings();
    const result = timerReducer(currentState, { type: 'TICK', settings: cachedSettings });
    currentState = result.state;
    await saveTimerState(currentState);
    updateBadge(currentState);

    // Process effects
    for (const effect of result.effects) {
      switch (effect.type) {
        case 'SESSION_COMPLETE': {
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0];
          const sessionDuration = currentState ? currentState.totalTime : settings.workDuration;
          const session: TimerSession = {
            id: crypto.randomUUID(),
            type: effect.sessionType,
            startedAt: new Date(now.getTime() - sessionDuration * 1000).toISOString(),
            endedAt: now.toISOString(),
            duration: sessionDuration,
            elapsed: sessionDuration,
            completed: true,
            interrupted: false,
            task: currentState.currentTask,
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
            await updateStreak(dateStr);
          }
          break;
        }

        case 'NOTIFY':
          await showNotification(effect.title, effect.body);
          break;
      }
    }
  }, 1000);
}

function stopTick(): void {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

function scheduleSyncAlarm(settings: { autoSync: boolean; syncIntervalMinutes: number }): void {
  if (settings.autoSync && settings.githubToken) {
    chrome.alarms.create(SYNC_ALARM_NAME, {
      periodInMinutes: settings.syncIntervalMinutes,
    });
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    try {
      await performSync();
    } catch {
      // Sync errors are logged in sync state
    }
  }
});

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
  const settings = await loadSettings();

  if (!currentState) {
    currentState = await loadTimerState() || createInitialState(settings);
  }

  switch (msg.type) {
    case 'GET_STATE': {
      const data = await loadAllData();
      return {
        success: true,
        data: {
          timer: currentState,
          settings: data.settings,
          todayStats: getTodayStats(data.dailyStats),
          streak: data.streak,
          syncState: data.syncState,
        },
      };
    }

    case 'START': {
      const result = timerReducer(currentState, {
        type: 'START',
        settings,
      });
      currentState = {
        ...result.state,
        currentTask: msg.task || currentState.currentTask,
      };
      await saveTimerState(currentState);
      updateBadge(currentState);
      startTick();
      return { success: true, data: currentState };
    }

    case 'PAUSE': {
      const result = timerReducer(currentState, { type: 'PAUSE', settings });
      currentState = result.state;
      await saveTimerState(currentState);
      updateBadge(currentState);
      stopTick();
      return { success: true, data: currentState };
    }

    case 'RESUME': {
      const result = timerReducer(currentState, { type: 'RESUME', settings });
      currentState = result.state;
      await saveTimerState(currentState);
      updateBadge(currentState);
      startTick();
      return { success: true, data: currentState };
    }

    case 'SKIP': {
      // Record interrupted session if was running
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
            interruptedPomodoros: current.interruptedPomodoros + (currentState!.currentSessionType === 'work' ? 1 : 0),
          }));
        }
      }

      stopTick();
      const result = timerReducer(currentState, { type: 'SKIP', settings });
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
      stopTick();
      // Record interrupted session if significant time elapsed
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

      const result = timerReducer(currentState, { type: 'RESET', settings });
      currentState = result.state;
      await saveTimerState(currentState);
      updateBadge(currentState);
      return { success: true, data: currentState };
    }

    case 'UPDATE_SETTINGS': {
      const { saveSettings: save } = await import('@/lib/storage');
      await save(msg.settings);
      // If timer is idle, update timeLeft to match new duration
      if (currentState.status === 'idle') {
        const newSettings = await loadSettings();
        const result = timerReducer(currentState, { type: 'RESET', settings: newSettings });
        currentState = result.state;
        await saveTimerState(currentState);
        updateBadge(currentState);
      }
      return { success: true };
    }

    case 'SYNC_NOW': {
      const syncState = await performSync();
      return { success: true, data: syncState };
    }

    case 'CLEAR_DATA': {
      const { clearAllData: clear } = await import('@/lib/storage');
      await clear();
      currentState = createInitialState(settings);
      await saveTimerState(currentState);
      updateBadge(currentState);
      stopTick();
      return { success: true };
    }

    default:
      return { success: false, error: 'Unknown message type' };
  }
}

function getTodayStats(dailyStats: Record<string, DailyStats>): DailyStats {
  const today = new Date().toISOString().split('T')[0];
  return dailyStats[today] || createEmptyDailyStats(today);
}
