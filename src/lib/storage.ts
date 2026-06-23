/* ─────────────────────────────────────────────────────
 *  Storage Manager — chrome.storage wrapper with
 *  type safety, batching, and change subscriptions.
 * ───────────────────────────────────────────────────── */

import type {
  Settings,
  DailyStats,
  StreakData,
  PlayerProgress,
  TimerSession,
  SyncState,
  TimerState,
} from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import {
  STORAGE_KEY_STATE,
  STORAGE_KEY_SESSIONS,
  STORAGE_KEY_DAILY,
  STORAGE_KEY_STREAK,
  STORAGE_KEY_SETTINGS,
  STORAGE_KEY_SYNC,
  STORAGE_KEY_PROGRESS,
} from './constants';

/* ── Generic helpers ───────────────────────────────── */

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T) ?? fallback;
  } catch {
    return fallback;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

async function getMany<T extends Record<string, unknown>>(
  keys: string[],
): Promise<T> {
  const result = await chrome.storage.local.get(keys);
  return result as T;
}

/* ── Timer State ───────────────────────────────────── */

export async function loadTimerState(): Promise<TimerState | null> {
  return get<TimerState | null>(STORAGE_KEY_STATE, null);
}

export async function saveTimerState(state: TimerState): Promise<void> {
  await set(STORAGE_KEY_STATE, state);
}

/* ── Settings ──────────────────────────────────────── */

export async function loadSettings(): Promise<Settings> {
  const stored = await get<Partial<Settings>>(STORAGE_KEY_SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const current = await loadSettings();
  await set(STORAGE_KEY_SETTINGS, { ...current, ...settings });
}

/* ── Sessions ──────────────────────────────────────── */

export async function loadSessions(): Promise<TimerSession[]> {
  return get<TimerSession[]>(STORAGE_KEY_SESSIONS, []);
}

// Write queue to prevent race conditions on concurrent adds
let progressWriteQueue: Promise<void> = Promise.resolve();

/* ── Player Progress ───────────────────────────────── */

export async function loadProgress(): Promise<PlayerProgress> {
  return get<PlayerProgress>(STORAGE_KEY_PROGRESS, {
    totalXP: 0,
    level: 1,
    forgivenessCardsUsed: 0,
    forgivenessCardsDate: '',
    dailyXP: 0,
    dailyXPDate: '',
    lastBonusStreak: 0,
  });
}

export async function saveProgress(progress: PlayerProgress): Promise<void> {
  await set(STORAGE_KEY_PROGRESS, progress);
}

export async function updateProgress(
  updater: (current: PlayerProgress) => PlayerProgress,
): Promise<PlayerProgress> {
  // Serialize through queue to prevent race conditions
  const resultPromise = progressWriteQueue.then(async () => {
    const current = await loadProgress();
    const updated = updater(current);
    await saveProgress(updated);
    return updated;
  });
  progressWriteQueue = resultPromise.then(() => undefined);
  return resultPromise;
}

// Write queue to prevent race conditions on concurrent adds
let sessionWriteQueue: Promise<void> = Promise.resolve();

export async function addSession(session: TimerSession): Promise<void> {
  sessionWriteQueue = sessionWriteQueue.then(async () => {
    const sessions = await loadSessions();
    sessions.push(session);
    // Keep last 1000 sessions to bound storage
    const trimmed = sessions.length > 1000 ? sessions.slice(-1000) : sessions;
    await set(STORAGE_KEY_SESSIONS, trimmed);
  });
  return sessionWriteQueue;
}

/* ── Daily Stats ───────────────────────────────────── */

export async function loadDailyStats(): Promise<Record<string, DailyStats>> {
  return get<Record<string, DailyStats>>(STORAGE_KEY_DAILY, {});
}

export async function updateDailyStats(
  date: string,
  updater: (current: DailyStats) => DailyStats,
): Promise<void> {
  const all = await loadDailyStats();
  const current = all[date] || createEmptyDailyStats(date);
  all[date] = updater(current);
  await set(STORAGE_KEY_DAILY, all);
}

export function createEmptyDailyStats(date: string): DailyStats {
  return {
    date,
    sessions: [],
    focusMinutes: 0,
    breakMinutes: 0,
    completedPomodoros: 0,
    interruptedPomodoros: 0,
    longestStreakMinutes: 0,
  };
}

/* ── Streak ─────────────────────────────────────────── */

export async function loadStreak(): Promise<StreakData> {
  return get<StreakData>(STORAGE_KEY_STREAK, {
    current: 0,
    longest: 0,
    lastActiveDate: '',
  });
}

export async function saveStreak(streak: StreakData): Promise<void> {
  await set(STORAGE_KEY_STREAK, streak);
}

export async function updateStreak(date: string): Promise<StreakData> {
  const streak = await loadStreak();

  if (streak.lastActiveDate === date) {
    return streak; // Already updated today
  }

  const yesterday = getYesterday(date);
  const isConsecutive = streak.lastActiveDate === yesterday;

  const newStreak: StreakData = {
    current: isConsecutive ? streak.current + 1 : 1,
    longest: Math.max(streak.longest, isConsecutive ? streak.current + 1 : 1),
    lastActiveDate: date,
  };

  await saveStreak(newStreak);
  return newStreak;
}

function getYesterday(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/* ── Sync State ────────────────────────────────────── */

export async function loadSyncState(): Promise<SyncState> {
  return get<SyncState>(STORAGE_KEY_SYNC, {
    status: 'idle',
    lastSyncAt: null,
    error: null,
    pendingChanges: 0,
  });
}

export async function saveSyncState(state: SyncState): Promise<void> {
  await set(STORAGE_KEY_SYNC, state);
}

/* ── Batch Operations ──────────────────────────────── */

export async function loadAllData(): Promise<{
  settings: Settings;
  dailyStats: Record<string, DailyStats>;
  streak: StreakData;
  syncState: SyncState;
  sessions: TimerSession[];
}> {
  const keys = [
    STORAGE_KEY_SETTINGS,
    STORAGE_KEY_DAILY,
    STORAGE_KEY_STREAK,
    STORAGE_KEY_SYNC,
    STORAGE_KEY_SESSIONS,
  ];

  const raw = await getMany<Record<string, unknown>>(keys);

  return {
    settings: { ...DEFAULT_SETTINGS, ...(raw[STORAGE_KEY_SETTINGS] as Partial<Settings> || {}) },
    dailyStats: (raw[STORAGE_KEY_DAILY] as Record<string, DailyStats>) || {},
    streak: (raw[STORAGE_KEY_STREAK] as StreakData) || { current: 0, longest: 0, lastActiveDate: '' },
    syncState: (raw[STORAGE_KEY_SYNC] as SyncState) || { status: 'idle', lastSyncAt: null, error: null, pendingChanges: 0 },
    sessions: (raw[STORAGE_KEY_SESSIONS] as TimerSession[]) || [],
  };
}

/* ── Clear ─────────────────────────────────────────── */

export async function clearAllData(): Promise<void> {
  await chrome.storage.local.remove([
    STORAGE_KEY_STATE,
    STORAGE_KEY_SESSIONS,
    STORAGE_KEY_DAILY,
    STORAGE_KEY_STREAK,
    STORAGE_KEY_SYNC,
  ]);
}

/* ── Change Listener ───────────────────────────────── */

export function onStorageChange(
  callback: (changes: Record<string, chrome.storage.StorageChange>) => void,
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ) => {
    if (area === 'local') {
      callback(changes);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
