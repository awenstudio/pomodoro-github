/* ─────────────────────────────────────────────────────
 *  Pet Autonomy — Pet wanders, plays, naps on its own.
 *
 *  The pet has a behavior state machine that ticks every
 *  few seconds. It picks a target (furniture/spot),
 *  walks there, and does an activity. Personality and
 *  mood affect behavior weights.
 * ───────────────────────────────────────────────────── */

export type BehaviorState =
  | 'idle'        // Standing, looking around
  | 'walking'     // Moving to a target
  | 'eating'      // At food bowl
  | 'playing'     // At toy box
  | 'sleeping'    // At bed
  | 'studying'    // At desk
  | 'reading'     // At bookshelf
  | 'gazing'      // At window
  | 'dancing'     // Happy random dance
  | 'sitting';    // Sitting on rug

export interface BehaviorTarget {
  id: string;
  x: number;       // 0-1 normalized position
  y: number;
  state: BehaviorState;
  duration: [number, number]; // min/max seconds
  weight: (mood: number, hunger: number) => number;
}

/** Default room furniture positions. */
export const FURNITURE_TARGETS: BehaviorTarget[] = [
  { id: 'desk',      x: 0.15, y: 0.25, state: 'studying',  duration: [20, 60], weight: (m, h) => m > 50 ? 3 : 1 },
  { id: 'bed',       x: 0.85, y: 0.25, state: 'sleeping',  duration: [15, 45], weight: (m, h) => m < 30 ? 5 : 1 },
  { id: 'food-bowl', x: 0.15, y: 0.75, state: 'eating',    duration: [5, 15],  weight: (m, h) => h < 40 ? 6 : 1 },
  { id: 'toy-box',   x: 0.85, y: 0.75, state: 'playing',   duration: [10, 30], weight: (m, h) => m > 60 ? 4 : 2 },
  { id: 'bookshelf', x: 0.85, y: 0.50, state: 'reading',   duration: [15, 40], weight: (m, h) => 2 },
  { id: 'window',    x: 0.50, y: 0.10, state: 'gazing',    duration: [10, 25], weight: (m, h) => 2 },
  { id: 'rug',       x: 0.50, y: 0.60, state: 'sitting',   duration: [8, 20],  weight: (m, h) => 3 },
];

export interface AutonomyState {
  behavior: BehaviorState;
  targetId: string | null;
  x: number;           // Current position 0-1
  y: number;
  targetX: number;     // Where we're going
  targetY: number;
  facing: 'left' | 'right';
  timer: number;       // Seconds remaining in current behavior
  nextDecision: number; // Seconds until next behavior decision
  bubble: string | null; // Thought bubble text
}

const IDLE_BUBBLES = ['💭', '❓', '✨', '😊', '🎵', '💤', '🌟'];
const ACTIVITY_BUBBLES: Partial<Record<BehaviorState, string[]>> = {
  eating: ['🍖 Yum!', '😋', '🍕 Nom nom'],
  playing: ['🎾!', '🎉 Whee!', '⚽ Fun!'],
  sleeping: ['💤 Zzz...', '😴', '🌙'],
  studying: ['📖 Hmm...', '✏️', '🧠'],
  reading: ['📚 Interesting...', '🤓', '✨'],
  gazing: ['☁️ Pretty...', '🌈', '🦋'],
  dancing: ['💃', '🎵 La la!', '✨'],
  sitting: ['😌', '🧘', '🌿'],
};

/** Pick a weighted random target. */
function pickTarget(mood: number, hunger: number, currentId: string | null): BehaviorTarget {
  const weights = FURNITURE_TARGETS
    .filter((t) => t.id !== currentId) // Don't pick same target
    .map((t) => ({ target: t, w: Math.max(0.1, t.weight(mood, hunger)) }));

  const total = weights.reduce((s, w) => s + w.w, 0);
  let r = Math.random() * total;
  for (const { target, w } of weights) {
    r -= w;
    if (r <= 0) return target;
  }
  return weights[weights.length - 1].target;
}

/** Random int in [min, max]. */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random float in [min, max]. */
function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Create initial autonomy state. */
export function createAutonomyState(): AutonomyState {
  const rug = FURNITURE_TARGETS.find((t) => t.id === 'rug')!;
  return {
    behavior: 'idle',
    targetId: null,
    x: rug.x,
    y: rug.y,
    targetX: rug.x,
    targetY: rug.y,
    facing: 'right',
    timer: 3,
    nextDecision: 2,
    bubble: null,
  };
}

/** Distance between two points. */
function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

const WALK_SPEED = 0.12; // units per second
const ARRIVAL_THRESHOLD = 0.03;

/**
 * Tick the autonomy state. Call this every ~1 second.
 * Returns the new state (immutable).
 */
export function tickAutonomy(
  state: AutonomyState,
  dt: number,
  mood: number,
  hunger: number,
): AutonomyState {
  let s = { ...state };

  // Update timer
  s.timer = Math.max(0, s.timer - dt);
  s.nextDecision = Math.max(0, s.nextDecision - dt);

  // Walking logic
  if (s.behavior === 'walking') {
    const dx = s.targetX - s.x;
    const dy = s.targetY - s.y;
    const d = dist(s.x, s.y, s.targetX, s.targetY);

    if (d < ARRIVAL_THRESHOLD) {
      // Arrived! Start the activity
      const target = FURNITURE_TARGETS.find((t) => t.id === s.targetId);
      if (target) {
        s.behavior = target.state;
        s.timer = randInt(target.duration[0], target.duration[1]);
        s.x = s.targetX;
        s.y = s.targetY;
        const bubbles = ACTIVITY_BUBBLES[target.state];
        s.bubble = bubbles ? bubbles[Math.floor(Math.random() * bubbles.length)] : null;
      } else {
        s.behavior = 'idle';
        s.timer = randInt(3, 8);
      }
    } else {
      // Move toward target
      const step = WALK_SPEED * dt;
      s.x += (dx / d) * Math.min(step, d);
      s.y += (dy / d) * Math.min(step, d);
      s.facing = dx > 0 ? 'right' : 'left';
      s.behavior = 'walking';
      s.bubble = null;
    }

    return s;
  }

  // Activity timer expired → decide next behavior
  if (s.timer <= 0 || s.nextDecision <= 0) {
    // Random chance to do a happy dance
    if (mood > 75 && Math.random() < 0.15) {
      s.behavior = 'dancing';
      s.timer = randInt(4, 8);
      s.bubble = '💃';
      s.nextDecision = s.timer + randInt(5, 15);
      return s;
    }

    // Pick a new target
    const target = pickTarget(mood, hunger, s.targetId);
    s.targetId = target.id;
    s.targetX = target.x + randFloat(-0.03, 0.03); // Slight randomness
    s.targetY = target.y + randFloat(-0.03, 0.03);
    s.behavior = 'walking';
    s.timer = 0;
    s.nextDecision = randInt(15, 40); // Re-evaluate in 15-40s
    s.bubble = null;

    // Face toward target
    s.facing = s.targetX > s.x ? 'right' : 'left';

    return s;
  }

  // Idle — occasional random bubble
  if (s.behavior === 'idle' && Math.random() < 0.02) {
    s.bubble = IDLE_BUBBLES[Math.floor(Math.random() * IDLE_BUBBLES.length)];
  }

  return s;
}

/** Get animation type for current behavior. */
export function behaviorToAnimation(behavior: BehaviorState): string {
  switch (behavior) {
    case 'walking': return 'walk';
    case 'eating': return 'eat';
    case 'playing': return 'play';
    case 'sleeping': return 'sleep';
    case 'studying': return 'study';
    case 'reading': return 'idle';
    case 'gazing': return 'idle';
    case 'dancing': return 'happy';
    case 'sitting': return 'sit';
    case 'idle':
    default: return 'idle';
  }
}
