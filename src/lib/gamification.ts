/* ─────────────────────────────────────────────────────
 *  Gamification — XP, Levels, Forgiveness, Daily Tasks
 *
 *  Ported from awen-studio's WeChat mini-program
 *  "番茄精灵" with adaptations for Chrome extension.
 * ───────────────────────────────────────────────────── */

/* ── Level Definitions ─────────────────────────────── */

export interface LevelInfo {
  level: number;
  name: string;
  icon: string;
  xpRequired: number;   // XP needed to reach this level from previous
  xpTotal: number;       // Cumulative XP to reach this level
  unlock: string;        // What gets unlocked at this level
}

const LEVEL_NAMES: { name: string; icon: string; unlock: string }[] = [
  { name: 'Seed',          icon: '🌱', unlock: 'Start your journey' },
  { name: 'Sprout',        icon: '🌿', unlock: 'Custom timer duration' },
  { name: 'Leaf',          icon: '🍃', unlock: 'Achievement system' },
  { name: 'Sapling',       icon: '🪴', unlock: 'White noise: Rain' },
  { name: 'Bloom',         icon: '🌸', unlock: 'Heatmap unlocked' },
  { name: 'Blossom',       icon: '🌺', unlock: 'Deep focus bonus' },
  { name: 'Fruit',         icon: '🍊', unlock: 'White noise: Café' },
  { name: 'Harvest',       icon: '🌾', unlock: 'Forgiveness card +1' },
  { name: 'Canopy',        icon: '🌳', unlock: 'White noise: Campfire' },
  { name: 'Forest',        icon: '🌲', unlock: 'Weekly report' },
  { name: 'Grove',         icon: '🏕️', unlock: 'Title: Focused Mind' },
  { name: 'Meadow',        icon: '🌻', unlock: 'Forgiveness card +1' },
  { name: 'Mountain',      icon: '⛰️', unlock: 'White noise: Ocean' },
  { name: 'Peak',          icon: '🏔️', unlock: 'Title: Deep Worker' },
  { name: 'Sky',           icon: '☁️', unlock: 'White noise: Wind' },
  { name: 'Cloud',         icon: '⛅', unlock: 'Title: Zen Master' },
  { name: 'Star',          icon: '⭐', unlock: 'Forgiveness card +1' },
  { name: 'Constellation', icon: '✨', unlock: 'Title: Focus Legend' },
  { name: 'Galaxy',        icon: '🌌', unlock: 'White noise: Space' },
  { name: 'Universe',      icon: '🔮', unlock: 'Title: Pomodoro Grandmaster' },
];

/* ── XP Calculation ────────────────────────────────── */

/**
 * XP earned for completing a pomodoro.
 * Based on mini-program's §1.1 formula.
 */
export function calculateSessionXP(
  durationMinutes: number,
  pomodorosTodayBeforeThis: number,
  isDeepFocus: boolean,
): number {
  // Base: 1 XP per minute of focus
  let xp = durationMinutes;

  // Consecutive pomodoro multiplier (2nd/3rd/4th today: +10%/20%/30%)
  const consecutiveIndex = pomodorosTodayBeforeThis; // 0-based (this will be the Nth)
  if (consecutiveIndex >= 1 && consecutiveIndex <= 3) {
    const multiplier = 1 + (consecutiveIndex * 0.1);
    xp = Math.round(xp * multiplier);
  }

  // Deep focus bonus (50+ min uninterrupted)
  if (isDeepFocus && durationMinutes >= 50) {
    xp += 10;
  }

  return xp;
}

/**
 * Daily task bonus XP.
 * Complete 3 pomodoros in a day = +50 XP.
 */
export function getDailyTaskBonus(completedToday: number): number {
  return completedToday >= 3 ? 50 : 0;
}

/**
 * Streak milestone bonus XP.
 */
export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 200;
  if (streakDays >= 21) return 120;
  if (streakDays >= 14) return 80;
  if (streakDays >= 7) return 50;
  return 0;
}

/**
 * Daily XP soft cap: 300 XP base, beyond that 20% reduction.
 */
export function applyDailyCap(xp: number, xpAlreadyToday: number): number {
  const CAP = 300;
  if (xpAlreadyToday >= CAP) {
    // Beyond cap: 20% rate
    return Math.round(xp * 0.2);
  }
  const remaining = CAP - xpAlreadyToday;
  if (xp <= remaining) return xp;
  // Partial: full XP up to cap, then 20% for the rest
  return remaining + Math.round((xp - remaining) * 0.2);
}

/* ── Level Progression ─────────────────────────────── */

/**
 * Calculate XP needed to reach level N from level N-1.
 * L1→L10: 25 × N (fast progression)
 * L10+: 8 × N^1.5, rounded to 10
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= 10) return 25 * (level - 1);
  return Math.round(8 * Math.pow(level - 1, 1.5) / 10) * 10;
}

/**
 * Cumulative XP needed to reach level N.
 */
export function cumulativeXPForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

/**
 * Get level info from total XP.
 */
export function getLevelFromXP(totalXP: number): {
  level: number;
  name: string;
  icon: string;
  unlock: string;
  currentXP: number;      // XP in current level
  requiredXP: number;     // XP needed for next level
  progress: number;       // 0-1 progress to next level
} {
  let level = 1;
  let cumulative = 0;

  while (level < LEVEL_NAMES.length) {
    const needed = xpForLevel(level + 1);
    if (cumulative + needed > totalXP) break;
    cumulative += needed;
    level++;
  }

  const currentXP = totalXP - cumulative;
  const requiredXP = level < LEVEL_NAMES.length ? xpForLevel(level + 1) : 0;
  const progress = requiredXP > 0 ? Math.min(1, currentXP / requiredXP) : 1;

  const info = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];

  return {
    level,
    name: info.name,
    icon: info.icon,
    unlock: info.unlock,
    currentXP,
    requiredXP,
    progress,
  };
}

/* ── Forgiveness Cards ─────────────────────────────── */

/**
 * Get number of forgiveness cards available based on level.
 * Level 1: 1 card, Level 8: +1, Level 12: +1, Level 17: +1 (max 4)
 */
export function getMaxForgivenessCards(level: number): number {
  let cards = 1;
  if (level >= 8) cards++;
  if (level >= 12) cards++;
  if (level >= 17) cards++;
  return cards;
}

/* ── Daily Multiplier ──────────────────────────────── */

/**
 * Get the XP multiplier for the Nth pomodoro today (0-based).
 */
export function getDailyMultiplier(pomodorosToday: number): string {
  if (pomodorosToday >= 4) return '×1.0';
  if (pomodorosToday >= 3) return '×1.3';
  if (pomodorosToday >= 2) return '×1.2';
  if (pomodorosToday >= 1) return '×1.1';
  return '×1.0';
}

/* ── Gentle Failure Messages ───────────────────────── */

const FAILURE_MESSAGES = [
  "It's okay, your progress is saved. Ready when you are.",
  "No worries — every minute of focus counts.",
  "Taking a break? That's part of the process.",
  "You showed up, and that matters. Let's try again.",
  "Focus is a practice, not a performance. Keep going.",
  "Even a short burst of focus is valuable.",
  "Your streak is safe. Come back anytime.",
];

export function getFailureMessage(): string {
  return FAILURE_MESSAGES[Math.floor(Math.random() * FAILURE_MESSAGES.length)];
}

/* ── Completion Celebration Messages ───────────────── */

const COMPLETE_MESSAGES = [
  "Great focus! 🍅",
  "One more down. Keep going! 💪",
  "Deep work achieved! 🧠",
  "You're in the zone! ⚡",
  "Pomodoro complete! 🎯",
  "Focused and finished! ✨",
  "That's how it's done! 🔥",
];

export function getCompleteMessage(): string {
  return COMPLETE_MESSAGES[Math.floor(Math.random() * COMPLETE_MESSAGES.length)];
}
