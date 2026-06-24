/* ─────────────────────────────────────────────────────
 *  Pomodoro GitHub — Type Definitions
 *  Single source of truth for all data structures.
 * ───────────────────────────────────────────────────── */

export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface TimerSession {
  id: string;
  type: SessionType;
  startedAt: string; // ISO-8601
  endedAt: string | null;
  duration: number; // planned seconds
  elapsed: number; // actual seconds
  completed: boolean;
  interrupted: boolean;
  task: TaskRef | null;
}

export interface TaskRef {
  name: string;
  repo: string | null;
  tags: string[];
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  sessions: TimerSession[];
  focusMinutes: number;
  breakMinutes: number;
  completedPomodoros: number;
  interruptedPomodoros: number;
  longestStreakMinutes: number;
}

export interface StreakData {
  current: number; // consecutive days
  longest: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface PlayerProgress {
  totalXP: number;
  level: number;
  forgivenessCardsUsed: number; // reset daily
  forgivenessCardsDate: string; // YYYY-MM-DD
  dailyXP: number;             // XP earned today (for cap calc)
  dailyXPDate: string;         // YYYY-MM-DD
  lastBonusStreak: number;     // last streak day that gave bonus
}

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

export interface Settings {
  // Timer durations (seconds)
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;

  // Goals
  dailyGoal: number; // pomodoros per day

  // Behavior
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationEnabled: boolean;

  // Google account (populated after login)
  googleUser: GoogleUser | null;
  autoSync: boolean;
  syncIntervalMinutes: number;
}

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  longBreakInterval: 4,
  dailyGoal: 8,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  notificationEnabled: true,
  googleUser: null,
  autoSync: true,
  syncIntervalMinutes: 5,
};

export interface SyncPayload {
  version: string;
  lastSync: string;
  dailyStats: Record<string, DailyStats>;
  streak: StreakData;
  settings: Partial<Settings>;
}

export interface SyncState {
  status: 'idle' | 'syncing' | 'error' | 'success';
  lastSyncAt: string | null;
  error: string | null;
  pendingChanges: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  status: TimerStatus;
  currentSessionType: SessionType;
  timeLeft: number; // seconds
  totalTime: number; // seconds for current session
  pomodorosInCycle: number; // completed in current long-break cycle
  currentTask: TaskRef | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  condition: (stats: Record<string, DailyStats>, streak: StreakData) => boolean;
}

// Message types for communication between popup and background
export type MessageType =
  | { type: 'GET_STATE' }
  | { type: 'START'; task?: TaskRef }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SKIP' }
  | { type: 'RESET' }
  | { type: 'USE_FORGIVENESS' }
  | { type: 'CREATE_PET'; species: string; name: string }
  | { type: 'FEED_PET' }
  | { type: 'PLAY_WITH_PET' }
  | { type: 'PET_PET' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<Settings> }
  | { type: 'SYNC_NOW' }
  | { type: 'GET_STATS' }
  | { type: 'CLEAR_DATA' }
  | { type: 'SWITCH_SESSION'; sessionType: SessionType };

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
