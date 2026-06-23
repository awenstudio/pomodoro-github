/* ─────────────────────────────────────────────────────
 *  Constants
 * ───────────────────────────────────────────────────── */

export const ALARM_NAME = 'pomodoro-tick';
export const SYNC_ALARM_NAME = 'pomodoro-sync';
export const STORAGE_KEY_STATE = 'pomodoro_timer_state';
export const STORAGE_KEY_SESSIONS = 'pomodoro_sessions';
export const STORAGE_KEY_DAILY = 'pomodoro_daily_stats';
export const STORAGE_KEY_STREAK = 'pomodoro_streak';
export const STORAGE_KEY_SETTINGS = 'pomodoro_settings';
export const STORAGE_KEY_SYNC = 'pomodoro_sync_state';
export const STORAGE_KEY_PROGRESS = 'pomodoro_progress';

export const TICK_INTERVAL_SECONDS = 1;

export const SESSION_COLORS: Record<string, string> = {
  work: '#ef4444',
  shortBreak: '#22c55e',
  longBreak: '#3b82f6',
};

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_pomodoro',
    name: 'First Tomato',
    description: 'Complete your first pomodoro',
    icon: '🍅',
  },
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
  },
  {
    id: 'streak_7',
    name: 'One Week Wonder',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
  },
  {
    id: 'pomodoros_100',
    name: 'Century Club',
    description: 'Complete 100 pomodoros',
    icon: '💯',
  },
  {
    id: 'pomodoros_500',
    name: 'Tomato Farmer',
    description: 'Complete 500 pomodoros',
    icon: '👨‍🌾',
  },
  {
    id: 'focus_1000',
    name: 'Deep Worker',
    description: 'Accumulate 1000 focus minutes',
    icon: '🧠',
  },
  {
    id: 'day_8_pomodoros',
    name: 'Perfect Day',
    description: 'Complete 8 pomodoros in a single day',
    icon: '⭐',
  },
];
