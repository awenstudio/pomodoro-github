/* ─────────────────────────────────────────────────────
 *  Pawodoro Icon Library — Vibrant CSS illustrated icons.
 *
 *  No external images needed. Pure CSS with gradients,
 *  shadows, and emoji fallbacks for maximum color.
 *  Style: Rounded, warm, lively, playful.
 * ───────────────────────────────────────────────────── */

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/* ── Vibrant CSS Icon Component ────────────────────── */

function cssIcon(emoji: string, bg: string, glow: string) {
  return function Icon({ size = 24, className = '', style }: IconProps) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl ${className}`}
        style={{
          width: size,
          height: size,
          background: bg,
          boxShadow: `0 2px 8px ${glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
          border: '1.5px solid rgba(255,255,255,0.15)',
          fontSize: size * 0.55,
          lineHeight: 1,
          ...style,
        }}
      >
        {emoji}
      </div>
    );
  };
}

/* ── Furniture Icons (warm earth tones) ────────────── */

export const IconDesk = cssIcon(
  '📚',
  'linear-gradient(135deg, #C4956A 0%, #A67B5B 100%)',
  'rgba(166,123,91,0.3)',
);
export const IconBed = cssIcon(
  '🛏️',
  'linear-gradient(135deg, #E8C4A0 0%, #D4A574 100%)',
  'rgba(212,165,116,0.3)',
);
export const IconFoodBowl = cssIcon(
  '🍖',
  'linear-gradient(135deg, #FF9E4A 0%, #E8833A 100%)',
  'rgba(255,158,74,0.3)',
);
export const IconToyBox = cssIcon(
  '🧸',
  'linear-gradient(135deg, #FF8A8A 0%, #E86868 100%)',
  'rgba(255,138,138,0.3)',
);
export const IconBookshelf = cssIcon(
  '📖',
  'linear-gradient(135deg, #7BA8D1 0%, #5B8AB8 100%)',
  'rgba(123,168,209,0.3)',
);
export const IconPlant = cssIcon(
  '🌿',
  'linear-gradient(135deg, #6FA85C 0%, #4D8B3E 100%)',
  'rgba(77,139,62,0.3)',
);
export const IconWindow = cssIcon(
  '🪟',
  'linear-gradient(135deg, #B8D4E8 0%, #8FBDD4 100%)',
  'rgba(143,189,212,0.3)',
);
export const IconRug = cssIcon(
  '🟫',
  'linear-gradient(135deg, #D4A574 0%, #B88B5E 100%)',
  'rgba(184,139,94,0.2)',
);

/* ── Status Icons (vibrant, eye-catching) ──────────── */

export const IconPomodoro = cssIcon(
  '🍅',
  'linear-gradient(135deg, #FF6B6B 0%, #E84545 100%)',
  'rgba(255,107,107,0.4)',
);
export const IconStreak = cssIcon(
  '🔥',
  'linear-gradient(135deg, #FF9E4A 0%, #FF6B35 100%)',
  'rgba(255,158,74,0.4)',
);
export const IconCard = cssIcon(
  '💫',
  'linear-gradient(135deg, #C4A4F7 0%, #9B7BD4 100%)',
  'rgba(196,164,247,0.4)',
);
export const IconXP = cssIcon(
  '⚡',
  'linear-gradient(135deg, #FFD97A 0%, #FFB830 100%)',
  'rgba(255,217,122,0.4)',
);
export const IconHeart = cssIcon(
  '❤️',
  'linear-gradient(135deg, #FF8A8A 0%, #FF5C8A 100%)',
  'rgba(255,92,138,0.4)',
);

/* ── Action Icons (playful, colorful) ──────────────── */

export const IconFeed = cssIcon(
  '🍖',
  'linear-gradient(135deg, #FF9E4A 0%, #E8833A 100%)',
  'rgba(255,158,74,0.35)',
);
export const IconPlay = cssIcon(
  '⚽',
  'linear-gradient(135deg, #7BA8D1 0%, #5B8AB8 100%)',
  'rgba(123,168,209,0.35)',
);
export const IconPetHand = cssIcon(
  '🤲',
  'linear-gradient(135deg, #FF8A8A 0%, #E86868 100%)',
  'rgba(255,138,138,0.35)',
);
export const IconStudy = cssIcon(
  '📖',
  'linear-gradient(135deg, #C4A4F7 0%, #9B7BD4 100%)',
  'rgba(196,164,247,0.35)',
);
export const IconSleep = cssIcon(
  '💤',
  'linear-gradient(135deg, #7BA8D1 0%, #5B8AB8 100%)',
  'rgba(123,168,209,0.35)',
);

/* ── Mode Icons (calm, distinct) ───────────────────── */

export const IconFocus = cssIcon(
  '🎯',
  'linear-gradient(135deg, #5AAF5E 0%, #4D8B3E 100%)',
  'rgba(90,175,94,0.35)',
);
export const IconRest = cssIcon(
  '☕',
  'linear-gradient(135deg, #7BA8D1 0%, #5B8AB8 100%)',
  'rgba(123,168,209,0.35)',
);
export const IconRelax = cssIcon(
  '🌸',
  'linear-gradient(135deg, #FF8A8A 0%, #E86868 100%)',
  'rgba(255,138,138,0.35)',
);

/* ── Mood Icons (for PetRoom) ──────────────────────── */

export const IconMoodHappy = cssIcon(
  '😊',
  'linear-gradient(135deg, #6FA85C 0%, #4D8B3E 100%)',
  'rgba(77,139,62,0.3)',
);
export const IconMoodNeutral = cssIcon(
  '😐',
  'linear-gradient(135deg, #E89B52 0%, #D4863A 100%)',
  'rgba(232,155,82,0.3)',
);
export const IconMoodSad = cssIcon(
  '😢',
  'linear-gradient(135deg, #E86868 0%, #CC4444 100%)',
  'rgba(232,104,104,0.3)',
);
