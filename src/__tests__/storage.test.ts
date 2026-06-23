/* ─────────────────────────────────────────────────────
 *  Storage Module Tests
 * ───────────────────────────────────────────────────── */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEFAULT_SETTINGS } from '@/types';

/* ── Mock chrome.storage.local ─────────────────────── */

let store: Record<string, unknown> = {};

const mockStorage = {
  get: vi.fn((key: string | string[]) => {
    if (Array.isArray(key)) {
      const result: Record<string, unknown> = {};
      for (const k of key) {
        if (k in store) result[k] = store[k];
      }
      return Promise.resolve(result);
    }
    return Promise.resolve(key in store ? { [key]: store[key] } : {});
  }),
  set: vi.fn((items: Record<string, unknown>) => {
    Object.assign(store, items);
    return Promise.resolve();
  }),
  remove: vi.fn((key: string | string[]) => {
    const keys = Array.isArray(key) ? key : [key];
    for (const k of keys) delete store[k];
    return Promise.resolve();
  }),
};

// @ts-expect-error — mock chrome global
global.chrome = {
  storage: {
    local: mockStorage,
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

/* ── Import after mock setup ───────────────────────── */

import {
  loadSettings,
  saveSettings,
  loadTimerState,
  saveTimerState,
  loadSessions,
  addSession,
  loadDailyStats,
  updateDailyStats,
  loadStreak,
  saveStreak,
  updateStreak,
  loadSyncState,
  saveSyncState,
  loadAllData,
  clearAllData,
  createEmptyDailyStats,
} from '@/lib/storage';

beforeEach(() => {
  store = {};
  vi.clearAllMocks();
});

/* ── Settings ──────────────────────────────────────── */

describe('Settings', () => {
  it('returns defaults when nothing stored', async () => {
    const settings = await loadSettings();
    expect(settings.workDuration).toBe(DEFAULT_SETTINGS.workDuration);
    expect(settings.shortBreakDuration).toBe(DEFAULT_SETTINGS.shortBreakDuration);
    expect(settings.dailyGoal).toBe(DEFAULT_SETTINGS.dailyGoal);
  });

  it('merges stored values with defaults', async () => {
    store = {
      pomodoro_settings: { workDuration: 600, dailyGoal: 10 },
    };
    const settings = await loadSettings();
    expect(settings.workDuration).toBe(600);
    expect(settings.dailyGoal).toBe(10);
    expect(settings.shortBreakDuration).toBe(DEFAULT_SETTINGS.shortBreakDuration);
  });

  it('saves and loads settings', async () => {
    await saveSettings({ workDuration: 900, dailyGoal: 6 });
    expect(mockStorage.set).toHaveBeenCalled();
    const settings = await loadSettings();
    expect(settings.workDuration).toBe(900);
  });
});

/* ── Timer State ───────────────────────────────────── */

describe('Timer State', () => {
  it('returns null when nothing stored', async () => {
    const state = await loadTimerState();
    expect(state).toBeNull();
  });

  it('saves and loads timer state', async () => {
    const mockState = {
      status: 'running',
      currentSessionType: 'work',
      timeLeft: 1200,
      totalTime: 1500,
      pomodorosInCycle: 1,
      currentTask: null,
    };
    await saveTimerState(mockState as any);
    const loaded = await loadTimerState();
    expect(loaded?.timeLeft).toBe(1200);
    expect(loaded?.status).toBe('running');
  });
});

/* ── Sessions ──────────────────────────────────────── */

describe('Sessions', () => {
  it('returns empty array when nothing stored', async () => {
    const sessions = await loadSessions();
    expect(sessions).toEqual([]);
  });

  it('adds a session', async () => {
    const session = {
      id: 'test-1',
      type: 'work' as const,
      startedAt: '2026-01-01T00:00:00Z',
      endedAt: '2026-01-01T00:25:00Z',
      duration: 1500,
      elapsed: 1500,
      completed: true,
      interrupted: false,
      task: null,
    };
    await addSession(session);
    const sessions = await loadSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe('test-1');
  });

  it('trims to 1000 sessions', async () => {
    // Pre-fill with 1000 sessions
    const sessions = Array.from({ length: 1000 }, (_, i) => ({
      id: `old-${i}`,
      type: 'work' as const,
      startedAt: '2026-01-01T00:00:00Z',
      endedAt: '2026-01-01T00:25:00Z',
      duration: 1500,
      elapsed: 1500,
      completed: true,
      interrupted: false,
      task: null,
    }));
    store = { pomodoro_sessions: sessions };

    await addSession({
      id: 'new-1',
      type: 'work' as const,
      startedAt: '2026-01-02T00:00:00Z',
      endedAt: '2026-01-02T00:25:00Z',
      duration: 1500,
      elapsed: 1500,
      completed: true,
      interrupted: false,
      task: null,
    });

    const result = await loadSessions();
    expect(result).toHaveLength(1000);
    expect(result[0].id).toBe('old-1'); // First old one was trimmed
    expect(result[999].id).toBe('new-1');
  });
});

/* ── Daily Stats ───────────────────────────────────── */

describe('Daily Stats', () => {
  it('returns empty object when nothing stored', async () => {
    const stats = await loadDailyStats();
    expect(stats).toEqual({});
  });

  it('creates empty daily stats', () => {
    const stats = createEmptyDailyStats('2026-01-01');
    expect(stats.date).toBe('2026-01-01');
    expect(stats.focusMinutes).toBe(0);
    expect(stats.completedPomodoros).toBe(0);
    expect(stats.sessions).toEqual([]);
  });

  it('updates daily stats with updater function', async () => {
    await updateDailyStats('2026-01-01', (current) => ({
      ...current,
      focusMinutes: 25,
      completedPomodoros: 1,
    }));

    const stats = await loadDailyStats();
    expect(stats['2026-01-01'].focusMinutes).toBe(25);
    expect(stats['2026-01-01'].completedPomodoros).toBe(1);
  });

  it('accumulates values across updates', async () => {
    await updateDailyStats('2026-01-01', (c) => ({
      ...c,
      focusMinutes: 25,
      completedPomodoros: 1,
    }));
    await updateDailyStats('2026-01-01', (c) => ({
      ...c,
      focusMinutes: c.focusMinutes + 25,
      completedPomodoros: c.completedPomodoros + 1,
    }));

    const stats = await loadDailyStats();
    expect(stats['2026-01-01'].focusMinutes).toBe(50);
    expect(stats['2026-01-01'].completedPomodoros).toBe(2);
  });
});

/* ── Streak ─────────────────────────────────────────── */

describe('Streak', () => {
  it('returns default streak when nothing stored', async () => {
    const streak = await loadStreak();
    expect(streak.current).toBe(0);
    expect(streak.longest).toBe(0);
    expect(streak.lastActiveDate).toBe('');
  });

  it('saves and loads streak', async () => {
    await saveStreak({ current: 5, longest: 10, lastActiveDate: '2026-01-05' });
    const streak = await loadStreak();
    expect(streak.current).toBe(5);
    expect(streak.longest).toBe(10);
  });

  it('updates streak for first day', async () => {
    const streak = await updateStreak('2026-01-01');
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(1);
    expect(streak.lastActiveDate).toBe('2026-01-01');
  });

  it('increments consecutive day streak', async () => {
    store = {
      pomodoro_streak: { current: 3, longest: 3, lastActiveDate: '2026-01-03' },
    };
    const streak = await updateStreak('2026-01-04');
    expect(streak.current).toBe(4);
    expect(streak.longest).toBe(4);
  });

  it('resets streak for non-consecutive day', async () => {
    store = {
      pomodoro_streak: { current: 5, longest: 5, lastActiveDate: '2026-01-01' },
    };
    const streak = await updateStreak('2026-01-03');
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(5); // Preserved
  });

  it('does not double-count same day', async () => {
    store = {
      pomodoro_streak: { current: 3, longest: 3, lastActiveDate: '2026-01-03' },
    };
    const streak = await updateStreak('2026-01-03');
    expect(streak.current).toBe(3); // Unchanged
  });
});

/* ── Sync State ────────────────────────────────────── */

describe('Sync State', () => {
  it('returns default when nothing stored', async () => {
    const state = await loadSyncState();
    expect(state.status).toBe('idle');
    expect(state.lastSyncAt).toBeNull();
    expect(state.error).toBeNull();
  });

  it('saves and loads sync state', async () => {
    await saveSyncState({
      status: 'success',
      lastSyncAt: '2026-01-01T00:00:00Z',
      error: null,
      pendingChanges: 0,
    });
    const state = await loadSyncState();
    expect(state.status).toBe('success');
  });
});

/* ── loadAllData ───────────────────────────────────── */

describe('loadAllData', () => {
  it('returns all defaults when nothing stored', async () => {
    const data = await loadAllData();
    expect(data.settings.workDuration).toBe(DEFAULT_SETTINGS.workDuration);
    expect(data.dailyStats).toEqual({});
    expect(data.streak.current).toBe(0);
    expect(data.syncState.status).toBe('idle');
    expect(data.sessions).toEqual([]);
  });
});

/* ── clearAllData ──────────────────────────────────── */

describe('clearAllData', () => {
  it('clears all data keys', async () => {
    store = {
      pomodoro_timer_state: { status: 'running' },
      pomodoro_sessions: [{ id: '1' }],
      pomodoro_daily_stats: { '2026-01-01': {} },
      pomodoro_streak: { current: 5 },
      pomodoro_sync_state: { status: 'success' },
    };
    await clearAllData();
    expect(mockStorage.remove).toHaveBeenCalled();
    expect(store).toEqual({});
  });
});
