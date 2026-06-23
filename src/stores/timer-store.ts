/* ─────────────────────────────────────────────────────
 *  Timer Store — Zustand store with chrome.storage
 *  persistence. Single source of truth for timer UI.
 * ───────────────────────────────────────────────────── */

import { create } from 'zustand';
import type {
  TimerState,
  TimerStatus,
  SessionType,
  Settings,
  TaskRef,
  DailyStats,
  StreakData,
  SyncState,
  PlayerProgress,
} from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { createInitialState, formatTime, getProgress as calcProgress } from '@/lib/timer-engine';

interface TimerStore {
  // Timer state
  timer: TimerState;
  timerStatus: TimerStatus;
  timeLeft: number;
  totalTime: number;
  currentSessionType: SessionType;
  timerProgress: number;       // 0-1 timer progress
  displayTime: string;
  pomodorosInCycle: number;

  // Data
  settings: Settings;
  todayStats: DailyStats | null;
  streak: StreakData;
  syncState: SyncState;

  // Current task
  currentTask: TaskRef | null;

  // Player progress (XP, level)
  progress: PlayerProgress;

  // Actions
  setTimerState: (state: TimerState) => void;
  setSettings: (settings: Settings) => void;
  setTodayStats: (stats: DailyStats | null) => void;
  setStreak: (streak: StreakData) => void;
  setSyncState: (state: SyncState) => void;
  setCurrentTask: (task: TaskRef | null) => void;
  setProgress: (progress: PlayerProgress) => void;

  // Derived
  isRunning: boolean;
  isPaused: boolean;
  isIdle: boolean;
  isWork: boolean;
  isBreak: boolean;
}

export const useTimerStore = create<TimerStore>((set) => ({
  // Initial values
  timer: createInitialState(DEFAULT_SETTINGS),
  timerStatus: 'idle',
  timeLeft: DEFAULT_SETTINGS.workDuration,
  totalTime: DEFAULT_SETTINGS.workDuration,
  currentSessionType: 'work',
  timerProgress: 0,
  displayTime: formatTime(DEFAULT_SETTINGS.workDuration),
  pomodorosInCycle: 0,
  settings: DEFAULT_SETTINGS,
  todayStats: null,
  streak: { current: 0, longest: 0, lastActiveDate: '' },
  syncState: { status: 'idle', lastSyncAt: null, error: null, pendingChanges: 0 },
  currentTask: null,
  progress: {
    totalXP: 0,
    level: 1,
    forgivenessCardsUsed: 0,
    forgivenessCardsDate: '',
    dailyXP: 0,
    dailyXPDate: '',
    lastBonusStreak: 0,
  },
  isRunning: false,
  isPaused: false,
  isIdle: true,
  isWork: true,
  isBreak: false,

  setTimerState: (timer) => {
    const timerProgress = calcProgress(timer);
    set({
      timer,
      timerStatus: timer.status,
      timeLeft: timer.timeLeft,
      totalTime: timer.totalTime,
      currentSessionType: timer.currentSessionType,
      timerProgress,
      displayTime: formatTime(timer.timeLeft),
      pomodorosInCycle: timer.pomodorosInCycle,
      currentTask: timer.currentTask,
      isRunning: timer.status === 'running',
      isPaused: timer.status === 'paused',
      isIdle: timer.status === 'idle',
      isWork: timer.currentSessionType === 'work',
      isBreak: timer.currentSessionType !== 'work',
    });
  },

  setSettings: (settings) => set({ settings }),
  setTodayStats: (todayStats) => set({ todayStats }),
  setStreak: (streak) => set({ streak }),
  setSyncState: (syncState) => set({ syncState }),
  setCurrentTask: (currentTask) => set({ currentTask }),
  setProgress: (progress) => set({ progress }),
}));
