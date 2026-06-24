/* ─────────────────────────────────────────────────────
 *  Pawodoro Icon Library — SVG icons replacing emoji.
 *
 *  Style: 24×24 viewBox, 2px stroke, round caps.
 *  Colors: cream-200 default, accent on active.
 *  Warm, chibi-friendly, consistent line weight.
 * ───────────────────────────────────────────────────── */

import { createElement } from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const defaultProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function icon(paths: string, extra?: Record<string, string>) {
  return function Icon({ size = 20, color = 'currentColor', className = '', style }: IconProps) {
    return createElement('svg', {
      ...defaultProps,
      width: size,
      height: size,
      stroke: color,
      className,
      style,
      dangerouslySetInnerHTML: { __html: paths + (extra?.decorations || '') },
    });
  };
}

/* ── Furniture Icons ────────────────────────────────── */

/** 📚 Study Desk */
export const IconDesk = icon(`
  <rect x="3" y="10" width="18" height="3" rx="1"/>
  <line x1="5" y1="13" x2="5" y2="20"/>
  <line x1="19" y1="13" x2="19" y2="20"/>
  <rect x="6" y="6" width="4" height="4" rx="0.5"/>
  <rect x="11" y="7" width="3" height="3" rx="0.5"/>
  <line x1="7" y1="6" x2="7" y2="10"/>
  <line x1="12.5" y1="7" x2="12.5" y2="10"/>
`);

/** 🛏️ Cozy Bed */
export const IconBed = icon(`
  <rect x="2" y="14" width="20" height="5" rx="1.5"/>
  <rect x="3" y="10" width="18" height="4" rx="1"/>
  <rect x="4" y="11" width="5" height="2" rx="0.5"/>
  <rect x="15" y="11" width="5" height="2" rx="0.5"/>
  <line x1="2" y1="19" x2="2" y2="21"/>
  <line x1="22" y1="19" x2="22" y2="21"/>
`);

/** 🍖 Food Bowl */
export const IconFoodBowl = icon(`
  <ellipse cx="12" cy="16" rx="8" ry="4"/>
  <path d="M4 16c0-4 3.6-7 8-7s8 3 8 7"/>
  <circle cx="9" cy="14" r="1.5"/>
  <circle cx="15" cy="14" r="1.5"/>
  <path d="M10 11.5c0.5-1 1.5-1.5 2-1.5"/>
`);

/** 🧸 Toy Box */
export const IconToyBox = icon(`
  <rect x="4" y="8" width="16" height="11" rx="1.5"/>
  <path d="M4 8h16"/>
  <path d="M8 8V6a4 4 0 0 1 8 0v2"/>
  <circle cx="12" cy="14" r="2"/>
  <line x1="12" y1="12" x2="12" y2="16"/>
  <line x1="10" y1="14" x2="14" y2="14"/>
`);

/** 📖 Bookshelf */
export const IconBookshelf = icon(`
  <rect x="3" y="3" width="18" height="18" rx="1"/>
  <line x1="3" y1="9" x2="21" y2="9"/>
  <line x1="3" y1="15" x2="21" y2="15"/>
  <rect x="5" y="4.5" width="2.5" height="4" rx="0.3"/>
  <rect x="8.5" y="5" width="2" height="3.5" rx="0.3"/>
  <rect x="11.5" y="4" width="2.5" height="4.5" rx="0.3"/>
  <rect x="5" y="10.5" width="3" height="4" rx="0.3"/>
  <rect x="9" y="11" width="2" height="3.5" rx="0.3"/>
  <rect x="14" y="10" width="2.5" height="4.5" rx="0.3"/>
  <rect x="17.5" y="11" width="2" height="3.5" rx="0.3"/>
`);

/** 🌿 Plant */
export const IconPlant = icon(`
  <path d="M12 22V12"/>
  <path d="M12 12c-3-3-7-2-7 2"/>
  <path d="M12 12c3-3 7-2 7 2"/>
  <path d="M12 8c-2-4-6-3-6 0"/>
  <path d="M12 8c2-4 6-3 6 0"/>
  <rect x="9" y="20" width="6" height="3" rx="1"/>
`);

/** 🪟 Window */
export const IconWindow = icon(`
  <rect x="4" y="3" width="16" height="18" rx="1.5"/>
  <line x1="12" y1="3" x2="12" y2="21"/>
  <line x1="4" y1="12" x2="20" y2="12"/>
  <path d="M6 6l3 3"/>
  <path d="M6 9l2 2"/>
`);

/** 🟫 Rug */
export const IconRug = icon(`
  <rect x="3" y="8" width="18" height="8" rx="2"/>
  <path d="M7 8v8"/>
  <path d="M17 8v8"/>
  <path d="M3 12h18"/>
`);

/* ── Status Icons ───────────────────────────────────── */

/** 🍅 Pomodoro */
export const IconPomodoro = icon(`
  <circle cx="12" cy="13" r="8"/>
  <path d="M12 5c-1-2-3-2-3-2s1 1 1.5 2"/>
  <path d="M12 5c1-2 3-2 3-2s-1 1-1.5 2"/>
  <path d="M10 5c0-1.5 1-3 2-3s2 1.5 2 3"/>
  <path d="M9 10c1.5 0.5 4.5 0.5 6 0"/>
`);

/** 🔥 Streak Fire */
export const IconStreak = icon(`
  <path d="M12 2c-1 3-4 5-4 9a4 4 0 0 0 8 0c0-4-3-6-4-9z"/>
  <path d="M12 22c-1.5 0-3-1-3-3 0-2 2-3 3-5 1 2 3 3 3 5 0 2-1.5 3-3 3z"/>
`);

/** 💫 Forgiveness Card */
export const IconCard = icon(`
  <rect x="3" y="5" width="18" height="14" rx="2"/>
  <path d="M3 10h18"/>
  <circle cx="8" cy="15" r="1.5"/>
  <line x1="12" y1="14" x2="17" y2="14"/>
  <line x1="12" y1="16.5" x2="15" y2="16.5"/>
`);

/** ⚡ XP Energy */
export const IconXP = icon(`
  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
`);

/** ❤️ Affinity Heart */
export const IconHeart = icon(`
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
`);

/** 🎯 Focus Target */
export const IconFocus = icon(`
  <circle cx="12" cy="12" r="9"/>
  <circle cx="12" cy="12" r="5"/>
  <circle cx="12" cy="12" r="1.5"/>
`);

/** ☕ Rest Coffee */
export const IconRest = icon(`
  <path d="M17 8h1a3 3 0 0 1 0 6h-1"/>
  <path d="M3 8h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>
  <line x1="6" y1="2" x2="6" y2="5"/>
  <line x1="10" y1="2" x2="10" y2="5"/>
  <line x1="14" y1="2" x2="14" y2="5"/>
`);

/** 🌸 Relax Flower */
export const IconRelax = icon(`
  <circle cx="12" cy="12" r="3"/>
  <path d="M12 2a3 3 0 0 1 0 6"/>
  <path d="M12 16a3 3 0 0 1 0 6"/>
  <path d="M2 12a3 3 0 0 1 6 0"/>
  <path d="M16 12a3 3 0 0 1 6 0"/>
  <path d="M4.93 4.93a3 3 0 0 1 4.24 4.24"/>
  <path d="M14.83 14.83a3 3 0 0 1 4.24 4.24"/>
  <path d="M4.93 19.07a3 3 0 0 1 4.24-4.24"/>
  <path d="M14.83 9.17a3 3 0 0 1 4.24-4.24"/>
`);

/* ── Action Icons ───────────────────────────────────── */

/** 🍖 Feed */
export const IconFeed = icon(`
  <path d="M12 2C9 2 7 4 7 7c0 2 1 3.5 2 4.5V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8.5c1-1 2-2.5 2-4.5 0-3-2-5-5-5z"/>
  <circle cx="10" cy="7" r="1"/>
  <circle cx="14" cy="7" r="1"/>
  <path d="M10 10.5c0.7 0.3 2.3 0.3 4 0"/>
`);

/** ⚽ Play */
export const IconPlay = icon(`
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 3c-2 2-3 5-3 9s1 7 3 9"/>
  <path d="M12 3c2 2 3 5 3 9s-1 7-3 9"/>
  <path d="M3.5 9h17"/>
  <path d="M3.5 15h17"/>
`);

/** 🤲 Pet (hand) */
export const IconPetHand = icon(`
  <path d="M18 11V6a2 2 0 0 0-4 0"/>
  <path d="M14 10V4a2 2 0 0 0-4 0v6"/>
  <path d="M10 10V6a2 2 0 0 0-4 0v8"/>
  <path d="M18 11a4 4 0 0 1 4 4v2a8 8 0 0 1-8 8H12a8 8 0 0 1-8-8v-3a2 2 0 0 1 4 0"/>
`);

/** 📖 Study */
export const IconStudy = icon(`
  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
`);

/** 💤 Sleep */
export const IconSleep = icon(`
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  <line x1="9" y1="9" x2="9.01" y2="9"/>
  <line x1="13" y1="13" x2="13.01" y2="13"/>
  <line x1="7" y1="13" x2="7.01" y2="13"/>
`);

/* ── Mood Icons ─────────────────────────────────────── */

/** 😊 Happy */
export const IconMoodHappy = icon(`
  <circle cx="12" cy="12" r="9"/>
  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
  <line x1="9" y1="9" x2="9.01" y2="9"/>
  <line x1="15" y1="9" x2="15.01" y2="9"/>
`);

/** 😐 Neutral */
export const IconMoodNeutral = icon(`
  <circle cx="12" cy="12" r="9"/>
  <line x1="8" y1="15" x2="16" y2="15"/>
  <line x1="9" y1="9" x2="9.01" y2="9"/>
  <line x1="15" y1="9" x2="15.01" y2="9"/>
`);

/** 😢 Sad */
export const IconMoodSad = icon(`
  <circle cx="12" cy="12" r="9"/>
  <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
  <line x1="9" y1="9" x2="9.01" y2="9"/>
  <line x1="15" y1="9" x2="15.01" y2="9"/>
  <path d="M15 7c-0.3 1-0.8 1.5-1.5 1.5"/>
`);

/* ── Level Stage Icons ──────────────────────────────── */

export const STAGE_ICONS: Record<string, string> = {
  '🌱': 'seed',
  '🌿': 'sprout',
  '🍃': 'leaf',
  '🪴': 'sapling',
  '🌸': 'bloom',
  '🌺': 'blossom',
  '🍊': 'fruit',
  '🌾': 'harvest',
  '🌳': 'canopy',
  '🌲': 'forest',
  '🏕️': 'grove',
  '🌻': 'meadow',
  '⛰️': 'mountain',
  '🏔️': 'peak',
  '☁️': 'sky',
  '⛅': 'cloud',
  '⭐': 'star',
  '✨': 'constellation',
  '🌌': 'galaxy',
  '🔮': 'universe',
};

/* ── Room Activity Icons ────────────────────────────── */

export const ACTIVITY_LABELS: Record<string, { icon: string; label: string }> = {
  focus: { icon: '📚', label: 'Study' },
  rest: { icon: '🛏️', label: 'Bedroom' },
  relax: { icon: '📖', label: 'Library' },
  idle: { icon: '🏠', label: 'Living Room' },
};
