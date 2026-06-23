/* ─────────────────────────────────────────────────────
 *  Pet System — Data model for Pawodoro pets
 *
 *  Growth stages: Egg → Baby → Child → Teen → Adult → Master → Legend
 *  Stats: Mood (0-100), Hunger (0-100), Affinity (0-10000)
 * ───────────────────────────────────────────────────── */

export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'master' | 'legend';

export type PetSpecies =
  | 'shiba'     // 柴犬 — starter
  | 'cat'       // 猫
  | 'rabbit'    // 兔子
  | 'fox'       // 狐狸
  | 'penguin'   // 企鹅
  | 'panda'     // 熊猫
  | 'dragon'    // 龙 — rare
  | 'robot'     // 机器人 — rare
  | 'alien';    // 外星宠物 — legendary

export type PetPersonality =
  | 'lively'    // 活泼
  | 'calm'      // 冷静
  | 'tsundere'  // 傲娇
  | 'gentle'    // 温柔
  | 'funny'     // 搞笑
  | 'genki'     // 元气
  | 'scholar';  // 学霸

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  personality: PetPersonality;
  stage: PetStage;

  // Stats
  mood: number;       // 0-100
  hunger: number;     // 0-100
  affinity: number;   // 0-10000

  // Growth
  xp: number;
  level: number;

  // Inventory
  coins: number;
  food: number;

  // Metadata
  createdAt: string;     // ISO-8601
  lastFedAt: string;
  lastInteractedAt: string;
  totalFocusMinutes: number;
  totalPomodoros: number;
}

/* ── Species Definitions ───────────────────────────── */

export const SPECIES_CONFIG: Record<PetSpecies, {
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'legendary';
  unlockCondition: string;
  stages: Record<PetStage, string>; // emoji per stage
}> = {
  shiba: {
    name: 'Shiba',
    emoji: '🐕',
    rarity: 'common',
    unlockCondition: 'Starter pet',
    stages: {
      egg: '🥚', baby: '🐶', child: '🐕', teen: '🐕‍🦺',
      adult: '🦮', master: '🐕‍🦺', legend: '✨🐕✨',
    },
  },
  cat: {
    name: 'Cat',
    emoji: '🐱',
    rarity: 'common',
    unlockCondition: 'Reach Level 5',
    stages: {
      egg: '🥚', baby: '🐱', child: '🐈', teen: '🐈‍⬛',
      adult: '🦁', master: '🐱‍👤', legend: '✨🐱✨',
    },
  },
  rabbit: {
    name: 'Rabbit',
    emoji: '🐰',
    rarity: 'common',
    unlockCondition: 'Reach Level 10',
    stages: {
      egg: '🥚', baby: '🐰', child: '🐇', teen: '🐇',
      adult: '🐰', master: '🐰', legend: '✨🐰✨',
    },
  },
  fox: {
    name: 'Fox',
    emoji: '🦊',
    rarity: 'common',
    unlockCondition: '7-day streak',
    stages: {
      egg: '🥚', baby: '🦊', child: '🦊', teen: '🦊',
      adult: '🦊', master: '🦊', legend: '✨🦊✨',
    },
  },
  penguin: {
    name: 'Penguin',
    emoji: '🐧',
    rarity: 'common',
    unlockCondition: 'Reach Level 15',
    stages: {
      egg: '🥚', baby: '🐧', child: '🐧', teen: '🐧',
      adult: '🐧', master: '🐧', legend: '✨🐧✨',
    },
  },
  panda: {
    name: 'Panda',
    emoji: '🐼',
    rarity: 'rare',
    unlockCondition: 'Complete 100 pomodoros',
    stages: {
      egg: '🥚', baby: '🐼', child: '🐼', teen: '🐼',
      adult: '🐼', master: '🐼', legend: '✨🐼✨',
    },
  },
  dragon: {
    name: 'Dragon',
    emoji: '🐉',
    rarity: 'rare',
    unlockCondition: 'Reach Level 30',
    stages: {
      egg: '🥚', baby: '🦎', child: '🐲', teen: '🐉',
      adult: '🐉', master: '🐉', legend: '✨🐉✨',
    },
  },
  robot: {
    name: 'Robot',
    emoji: '🤖',
    rarity: 'rare',
    unlockCondition: '30-day streak',
    stages: {
      egg: '⚙️', baby: '🤖', child: '🤖', teen: '🤖',
      adult: '🤖', master: '🤖', legend: '✨🤖✨',
    },
  },
  alien: {
    name: 'Alien',
    emoji: '👽',
    rarity: 'legendary',
    unlockCondition: '100-day streak',
    stages: {
      egg: '🔮', baby: '👽', child: '👽', teen: '👽',
      adult: '👽', master: '👽', legend: '✨👽✨',
    },
  },
};

/* ── Stage Progression ─────────────────────────────── */

export const STAGE_ORDER: PetStage[] = [
  'egg', 'baby', 'child', 'teen', 'adult', 'master', 'legend',
];

export const STAGE_XP_REQUIREMENTS: Record<PetStage, number> = {
  egg: 0,
  baby: 50,       // ~2 pomodoros
  child: 200,     // ~8 pomodoros
  teen: 500,      // ~20 pomodoros
  adult: 1500,    // ~60 pomodoros
  master: 5000,   // ~200 pomodoros
  legend: 15000,  // ~600 pomodoros
};

export const STAGE_NAMES: Record<PetStage, string> = {
  egg: 'Egg',
  baby: 'Baby',
  child: 'Child',
  teen: 'Teen',
  adult: 'Adult',
  master: 'Master',
  legend: 'Legend',
};

/* ── Personality Dialogues ─────────────────────────── */

export const PERSONALITY_GREETINGS: Record<PetPersonality, string[]> = {
  lively: ["I'm so excited to see you!", "Let's focus together!", "Ready for action!"],
  calm: ["Welcome back.", "Let's begin quietly.", "I'm here when you're ready."],
  tsundere: ["Oh, you're back? I wasn't waiting or anything...", "Don't get the wrong idea!", "I guess we can focus together..."],
  gentle: ["Welcome back, dear.", "I missed you.", "Let's take it one step at a time."],
  funny: ["Did you miss me? I missed me too.", "Let's focus! Or not. Just kidding, let's focus.", "I was practicing my sitting skills."],
  genki: ["Yaaay! You're here!", "Let's do our best today!", "Energy level: MAX!"],
  scholar: ["Studies show that focused work improves with breaks.", "Shall we begin our research session?", "Knowledge awaits."],
};

export function getPersonalityGreeting(personality: PetPersonality): string {
  const greetings = PERSONALITY_GREETINGS[personality];
  return greetings[Math.floor(Math.random() * greetings.length)];
}
