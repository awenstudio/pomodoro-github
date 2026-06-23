/* ─────────────────────────────────────────────────────
 *  Timer Engine — Pure, deterministic state machine.
 *  No side-effects. Works in both SW and popup contexts.
 *
 *  Settings are passed as a parameter (not embedded
 *  in events) so the engine stays pure.
 * ───────────────────────────────────────────────────── */

import type { TimerState, SessionType, Settings } from '@/types';

/* ── Events ────────────────────────────────────────── */

export type TimerEvent =
  | { type: 'TICK' }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SKIP' }
  | { type: 'RESET' }
  | { type: 'COMPLETE' }
  | { type: 'SESSION_DONE' };

/* ── Effects (side-effects the caller must handle) ── */

export type TimerEffect =
  | { type: 'SESSION_COMPLETE'; sessionType: SessionType }
  | { type: 'CYCLE_COMPLETE' }
  | { type: 'NOTIFY'; title: string; body: string };

export interface TimerEngineResult {
  state: TimerState;
  effects: TimerEffect[];
}

/* ── Initial state factory ─────────────────────────── */

export function createInitialState(settings: Settings): TimerState {
  return {
    status: 'idle',
    currentSessionType: 'work',
    timeLeft: settings.workDuration,
    totalTime: settings.workDuration,
    pomodorosInCycle: 0,
    currentTask: null,
  };
}

/* ── Reducer ───────────────────────────────────────── */

export function timerReducer(
  state: TimerState,
  event: TimerEvent,
  settings: Settings,
): TimerEngineResult {
  const effects: TimerEffect[] = [];

  switch (event.type) {
    case 'START': {
      const duration = getDuration(state.currentSessionType, settings);
      return {
        state: {
          ...state,
          status: 'running',
          timeLeft: duration,
          totalTime: duration,
        },
        effects,
      };
    }

    case 'PAUSE': {
      if (state.status !== 'running') return { state, effects };
      return {
        state: { ...state, status: 'paused' },
        effects,
      };
    }

    case 'RESUME': {
      if (state.status !== 'paused') return { state, effects };
      return {
        state: { ...state, status: 'running' },
        effects,
      };
    }

    case 'TICK': {
      if (state.status !== 'running') return { state, effects };
      const newTimeLeft = Math.max(0, state.timeLeft - 1);
      if (newTimeLeft === 0) {
        return handleComplete(state, settings);
      }
      return {
        state: { ...state, timeLeft: newTimeLeft },
        effects,
      };
    }

    case 'COMPLETE': {
      return handleComplete(state, settings);
    }

    case 'SKIP': {
      const next = advanceSession(state, settings);
      return { state: next.state, effects: [...effects, ...next.effects] };
    }

    case 'RESET': {
      const duration = getDuration(state.currentSessionType, settings);
      return {
        state: {
          ...state,
          status: 'idle',
          timeLeft: duration,
          totalTime: duration,
        },
        effects,
      };
    }

    case 'SESSION_DONE': {
      const next = advanceSession(state, settings);
      return { state: next.state, effects: [...effects, ...next.effects] };
    }

    default:
      return { state, effects };
  }
}

/* ── Internal helpers ──────────────────────────────── */

function handleComplete(
  state: TimerState,
  settings: Settings,
): TimerEngineResult {
  const effects: TimerEffect[] = [];
  const wasWork = state.currentSessionType === 'work';

  effects.push({
    type: 'SESSION_COMPLETE',
    sessionType: state.currentSessionType,
  });

  if (wasWork) {
    const newCount = state.pomodorosInCycle + 1;
    effects.push({
      type: 'NOTIFY',
      title: '🍅 Pomodoro Complete!',
      body:
        newCount % settings.longBreakInterval === 0
          ? 'Great work! Time for a long break.'
          : 'Take a short break, you earned it.',
    });

    if (newCount % settings.longBreakInterval === 0) {
      effects.push({ type: 'CYCLE_COMPLETE' });
    }
  } else {
    effects.push({
      type: 'NOTIFY',
      title: '⏰ Break Over',
      body: 'Ready to focus again?',
    });
  }

  const next = advanceSession(state, settings);
  return { state: next.state, effects: [...effects, ...next.effects] };
}

function advanceSession(
  state: TimerState,
  settings: Settings,
): TimerEngineResult {
  const effects: TimerEffect[] = [];
  const wasWork = state.currentSessionType === 'work';
  let newPomodorosInCycle = state.pomodorosInCycle;

  let nextType: SessionType;
  if (wasWork) {
    newPomodorosInCycle++;
    nextType =
      newPomodorosInCycle % settings.longBreakInterval === 0
        ? 'longBreak'
        : 'shortBreak';
  } else {
    nextType = 'work';
  }

  const duration = getDuration(nextType, settings);
  const shouldAutoStart =
    (wasWork && settings.autoStartBreaks) ||
    (!wasWork && settings.autoStartWork);

  return {
    state: {
      status: shouldAutoStart ? 'running' : 'idle',
      currentSessionType: nextType,
      timeLeft: duration,
      totalTime: duration,
      pomodorosInCycle: newPomodorosInCycle,
      currentTask: state.currentTask,
    },
    effects,
  };
}

function getDuration(type: SessionType, settings: Settings): number {
  switch (type) {
    case 'work':
      return settings.workDuration;
    case 'shortBreak':
      return settings.shortBreakDuration;
    case 'longBreak':
      return settings.longBreakDuration;
  }
}

/* ── Selectors ─────────────────────────────────────── */

export function getProgress(state: TimerState): number {
  if (state.totalTime === 0) return 0;
  return 1 - state.timeLeft / state.totalTime;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
