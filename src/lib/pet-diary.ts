/* ─────────────────────────────────────────────────────
 *  PetDiary — Growth diary with milestones.
 *
 *  Shows pet's life story: when it was born,
 *  milestones reached, favorite activities, and
 *  memorable moments. Auto-generates entries.
 * ───────────────────────────────────────────────────── */

import type { Pet } from '@/lib/pet-system';
import { STAGE_NAMES } from '@/lib/pet-system';

/* ── Types ─────────────────────────────────────────── */

export interface DiaryEntry {
  id: string;
  timestamp: number;
  type: 'milestone' | 'daily' | 'special' | 'first';
  icon: string;
  title: string;
  body: string;
}

/* ── Generate diary entries from pet data ──────────── */

export function generateDiaryEntries(pet: Pet): DiaryEntry[] {
  const entries: DiaryEntry[] = [];
  const createdDate = new Date(pet.createdAt);

  // Birth entry
  entries.push({
    id: 'birth',
    timestamp: pet.createdAt,
    type: 'first',
    icon: '🥚',
    title: `${pet.name} was born!`,
    body: `A little ${pet.species} named ${pet.name} came into this world. It looked around with curious eyes, ready to explore.`,
  });

  // Stage milestones
  const stages: { stage: typeof pet.stage; xp: number; icon: string }[] = [
    { stage: 'baby', xp: 0, icon: '🐣' },
    { stage: 'child', xp: 50, icon: '🌿' },
    { stage: 'teen', xp: 200, icon: '🌱' },
    { stage: 'adult', xp: 500, icon: '🌳' },
    { stage: 'master', xp: 1200, icon: '⭐' },
    { stage: 'legend', xp: 2500, icon: '👑' },
  ];

  for (const s of stages) {
    if (pet.totalPomodoros > 0 && pet.xp >= s.xp) {
      const daysSinceBirth = Math.max(1, Math.floor((Date.now() - pet.createdAt) / 86400000));
      entries.push({
        id: `stage-${s.stage}`,
        timestamp: pet.createdAt + (s.xp / 10) * 60000, // Approximate
        type: 'milestone',
        icon: s.icon,
        title: `Reached ${STAGE_NAMES[s.stage]}!`,
        body: `${pet.name} has grown into a ${STAGE_NAMES[s.stage]}. ${getStageComment(s.stage, pet.species)}.`,
      });
    }
  }

  // Pomodoro milestones
  const pomMilestones = [1, 10, 50, 100, 200, 500, 1000];
  for (const m of pomMilestones) {
    if (pet.totalPomodoros >= m) {
      entries.push({
        id: `pom-${m}`,
        timestamp: pet.createdAt + m * 25 * 60000,
        type: 'milestone',
        icon: m >= 100 ? '🏆' : '🍅',
        title: `${m} Pomodoros!`,
        body: getPomodoroComment(m, pet.name),
      });
    }
  }

  // Focus hour milestones
  const hourMilestones = [1, 10, 50, 100, 500];
  for (const h of hourMilestones) {
    if (pet.totalFocusMinutes >= h * 60) {
      entries.push({
        id: `hour-${h}`,
        timestamp: pet.createdAt + h * 3600000,
        type: 'milestone',
        icon: '⏰',
        title: `${h} Hours of Focus!`,
        body: `${pet.name} has spent ${h} hours helping you stay focused. That's dedication!`,
      });
    }
  }

  // Affinity milestones
  const affinityMilestones = [100, 500, 1000, 3000, 5000, 10000];
  for (const a of affinityMilestones) {
    if (pet.affinity >= a) {
      entries.push({
        id: `affinity-${a}`,
        timestamp: pet.createdAt + a * 1000,
        type: 'special',
        icon: '❤️',
        title: `Bond Level ${a}!`,
        body: getAffinityComment(a, pet.name),
      });
    }
  }

  // Sort by timestamp
  entries.sort((a, b) => a.timestamp - b.timestamp);

  return entries;
}

/* ── Comment generators ────────────────────────────── */

function getStageComment(stage: string, species: string): string {
  const comments: Record<string, string> = {
    baby: 'Still tiny, but full of energy and curiosity',
    child: 'Growing stronger every day, loves to explore',
    teen: 'Energetic and a bit rebellious, but always loyal',
    adult: 'Mature and wise, a true companion',
    master: 'Has achieved mastery — an inspiration to all',
    legend: 'A legendary companion, feared and loved by all',
  };
  return comments[stage] || 'Growing stronger!';
}

function getPomodoroComment(count: number, name: string): string {
  if (count === 1) return `The very first pomodoro! ${name} is so proud.`;
  if (count === 10) return `Double digits! ${name} is getting the hang of this.`;
  if (count === 50) return `Half a century! ${name} is a focus machine.`;
  if (count === 100) return `Triple digits! ${name} is a true productivity warrior.`;
  if (count === 200) return `200 pomodoros! ${name} has laser focus.`;
  if (count === 500) return `500 pomodoros! ${name} is a legend in the making.`;
  if (count === 1000) return `1000 POMODOROS! ${name} has transcended mortal focus.`;
  return `${count} pomodoros and counting!`;
}

function getAffinityComment(affinity: number, name: string): string {
  if (affinity <= 100) return `${name} is starting to trust you. Keep going!`;
  if (affinity <= 500) return `${name} really enjoys your company!`;
  if (affinity <= 1000) return `${name} considers you a best friend!`;
  if (affinity <= 3000) return `The bond between you and ${name} is unbreakable.`;
  if (affinity <= 5000) return `${name} would follow you anywhere. True devotion.`;
  return `${name} and you are soulmates. Nothing can separate you.`;
}
