/* ─────────────────────────────────────────────────────
 *  Timer Engine Tests
 * ───────────────────────────────────────────────────── */

import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  timerReducer,
  formatTime,
  getProgress,
} from '@/lib/timer-engine';
import type { Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

const testSettings: Settings = {
  ...DEFAULT_SETTINGS,
  workDuration: 1500,      // 25 min
  shortBreakDuration: 300,  // 5 min
  longBreakDuration: 900,   // 15 min
  longBreakInterval: 4,
};

describe('createInitialState', () => {
  it('creates idle state with work duration', () => {
    const state = createInitialState(testSettings);
    expect(state.status).toBe('idle');
    expect(state.currentSessionType).toBe('work');
    expect(state.timeLeft).toBe(1500);
    expect(state.totalTime).toBe(1500);
    expect(state.pomodorosInCycle).toBe(0);
    expect(state.currentTask).toBeNull();
  });
});

describe('timerReducer — START', () => {
  it('transitions from idle to running', () => {
    const state = createInitialState(testSettings);
    const result = timerReducer(state, { type: 'START' }, testSettings);
    expect(result.state.status).toBe('running');
    expect(result.state.timeLeft).toBe(1500);
    expect(result.state.totalTime).toBe(1500);
    expect(result.effects).toHaveLength(0);
  });

  it('starts with correct break duration', () => {
    const state = createInitialState(testSettings);
    const breakState = { ...state, currentSessionType: 'shortBreak' as const };
    const result = timerReducer(breakState, { type: 'START' }, testSettings);
    expect(result.state.timeLeft).toBe(300);
    expect(result.state.totalTime).toBe(300);
  });
});

describe('timerReducer — PAUSE', () => {
  it('pauses a running timer', () => {
    const state = { ...createInitialState(testSettings), status: 'running' as const };
    const result = timerReducer(state, { type: 'PAUSE' }, testSettings);
    expect(result.state.status).toBe('paused');
  });

  it('ignores pause when idle', () => {
    const state = createInitialState(testSettings);
    const result = timerReducer(state, { type: 'PAUSE' }, testSettings);
    expect(result.state.status).toBe('idle');
  });
});

describe('timerReducer — RESUME', () => {
  it('resumes a paused timer', () => {
    const state = { ...createInitialState(testSettings), status: 'paused' as const };
    const result = timerReducer(state, { type: 'RESUME' }, testSettings);
    expect(result.state.status).toBe('running');
  });

  it('ignores resume when idle', () => {
    const state = createInitialState(testSettings);
    const result = timerReducer(state, { type: 'RESUME' }, testSettings);
    expect(result.state.status).toBe('idle');
  });
});

describe('timerReducer — TICK', () => {
  it('decrements timeLeft by 1', () => {
    const state = { ...createInitialState(testSettings), status: 'running' as const };
    const result = timerReducer(state, { type: 'TICK' }, testSettings);
    expect(result.state.timeLeft).toBe(1499);
  });

  it('ignores tick when paused', () => {
    const state = { ...createInitialState(testSettings), status: 'paused' as const, timeLeft: 100 };
    const result = timerReducer(state, { type: 'TICK' }, testSettings);
    expect(result.state.timeLeft).toBe(100);
  });

  it('ignores tick when idle', () => {
    const state = createInitialState(testSettings);
    const result = timerReducer(state, { type: 'TICK' }, testSettings);
    expect(result.state.timeLeft).toBe(1500);
  });

  it('triggers completion when timeLeft reaches 0 and auto-advances', () => {
    const state = { ...createInitialState(testSettings), status: 'running' as const, timeLeft: 1 };
    const result = timerReducer(state, { type: 'TICK' }, testSettings);
    // Engine auto-advances to shortBreak after work completes
    expect(result.state.currentSessionType).toBe('shortBreak');
    expect(result.state.timeLeft).toBe(300);
    expect(result.effects).toContainEqual(
      expect.objectContaining({ type: 'SESSION_COMPLETE' }),
    );
  });

  it('auto-advances to short break after work', () => {
    const state = { ...createInitialState(testSettings), status: 'running' as const, timeLeft: 1 };
    const result = timerReducer(state, { type: 'TICK' }, testSettings);
    expect(result.state.currentSessionType).toBe('shortBreak');
    expect(result.state.timeLeft).toBe(300);
  });

  it('auto-advances to long break after 4th pomodoro', () => {
    const state = {
      ...createInitialState(testSettings),
      status: 'running' as const,
      timeLeft: 1,
      pomodorosInCycle: 3, // Will become 4 after completion
    };
    const result = timerReducer(state, { type: 'TICK' }, testSettings);
    expect(result.state.currentSessionType).toBe('longBreak');
    expect(result.state.timeLeft).toBe(900);
  });

  it('auto-advances to work after break', () => {
    const state = {
      ...createInitialState(testSettings),
      status: 'running' as const,
      currentSessionType: 'shortBreak' as const,
      timeLeft: 1,
      totalTime: 300,
    };
    const result = timerReducer(state, { type: 'TICK' }, testSettings);
    expect(result.state.currentSessionType).toBe('work');
    expect(result.state.timeLeft).toBe(1500);
  });
});

describe('timerReducer — SKIP', () => {
  it('advances to next session', () => {
    const state = createInitialState(testSettings);
    const result = timerReducer(state, { type: 'SKIP' }, testSettings);
    expect(result.state.currentSessionType).toBe('shortBreak');
  });

  it('skipping from break goes to work', () => {
    const state = { ...createInitialState(testSettings), currentSessionType: 'shortBreak' as const };
    const result = timerReducer(state, { type: 'SKIP' }, testSettings);
    expect(result.state.currentSessionType).toBe('work');
  });
});

describe('timerReducer — RESET', () => {
  it('resets to idle with full duration', () => {
    const state = { ...createInitialState(testSettings), status: 'running' as const, timeLeft: 500 };
    const result = timerReducer(state, { type: 'RESET' }, testSettings);
    expect(result.state.status).toBe('idle');
    expect(result.state.timeLeft).toBe(1500);
  });

  it('reset after START preserves session type', () => {
    const state = { ...createInitialState(testSettings), currentSessionType: 'shortBreak' as const };
    const result = timerReducer(state, { type: 'RESET' }, testSettings);
    expect(result.state.currentSessionType).toBe('shortBreak');
    expect(result.state.timeLeft).toBe(300);
  });
});

describe('timerReducer — SKIP then START', () => {
  it('can start after skip', () => {
    const state = createInitialState(testSettings);
    const skipped = timerReducer(state, { type: 'SKIP' }, testSettings);
    const started = timerReducer(skipped.state, { type: 'START' }, testSettings);
    expect(started.state.status).toBe('running');
  });
});

describe('formatTime', () => {
  it('formats 0 seconds', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('00:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(1500)).toBe('25:00');
  });

  it('formats single digit minutes', () => {
    expect(formatTime(300)).toBe('05:00');
  });

  it('formats large values', () => {
    expect(formatTime(3661)).toBe('61:01');
  });
});

describe('getProgress', () => {
  it('returns 0 at start', () => {
    const state = createInitialState(testSettings);
    expect(getProgress(state)).toBe(0);
  });

  it('returns ~1 when timeLeft is near 0', () => {
    const state = { ...createInitialState(testSettings), timeLeft: 1 };
    expect(getProgress(state)).toBeCloseTo(0.999, 2);
  });

  it('returns 0.5 at half time', () => {
    const state = { ...createInitialState(testSettings), timeLeft: 750 };
    expect(getProgress(state)).toBeCloseTo(0.5, 2);
  });

  it('returns 0 when totalTime is 0 (edge case)', () => {
    const state = { ...createInitialState(testSettings), totalTime: 0 };
    expect(getProgress(state)).toBe(0);
  });
});

describe('Edge cases', () => {
  it('consecutive SKIPs cycle correctly', () => {
    let state = createInitialState(testSettings);
    state = timerReducer(state, { type: 'SKIP' }, testSettings).state;
    expect(state.currentSessionType).toBe('shortBreak');
    state = timerReducer(state, { type: 'SKIP' }, testSettings).state;
    expect(state.currentSessionType).toBe('work');
    state = timerReducer(state, { type: 'SKIP' }, testSettings).state;
    expect(state.currentSessionType).toBe('shortBreak');
  });

  it('RESET then START works correctly', () => {
    const state = { ...createInitialState(testSettings), status: 'running' as const, timeLeft: 100 };
    const reset = timerReducer(state, { type: 'RESET' }, testSettings);
    expect(reset.state.status).toBe('idle');
    const started = timerReducer(reset.state, { type: 'START' }, testSettings);
    expect(started.state.status).toBe('running');
    expect(started.state.timeLeft).toBe(1500);
  });

  it('PAUSE then RESUME preserves timeLeft', () => {
    let state = { ...createInitialState(testSettings), status: 'running' as const, timeLeft: 1234 };
    state = timerReducer(state, { type: 'PAUSE' }, testSettings).state;
    expect(state.timeLeft).toBe(1234);
    state = timerReducer(state, { type: 'RESUME' }, testSettings).state;
    expect(state.timeLeft).toBe(1234);
    expect(state.status).toBe('running');
  });

  it('pomodorosInCycle increments correctly through full cycle', () => {
    let state = createInitialState(testSettings);
    // Complete 4 work sessions
    for (let i = 0; i < 4; i++) {
      state = { ...state, status: 'running' as const, timeLeft: 1 };
      state = timerReducer(state, { type: 'TICK' }, testSettings).state;
      expect(state.pomodorosInCycle).toBe(i + 1);
      // Skip the break
      if (i < 3) {
        state = timerReducer(state, { type: 'SKIP' }, testSettings).state;
      }
    }
    expect(state.currentSessionType).toBe('longBreak');
    expect(state.pomodorosInCycle).toBe(4);
  });
});
