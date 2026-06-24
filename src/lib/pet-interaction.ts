/* ─────────────────────────────────────────────────────
 *  Pet Interaction Engine
 *
 *  Handles cooldowns, diminishing returns, personality
 *  reactions, stat decay, and interaction state machine.
 *
 *  Game design: action→reward→growth requires meaningful
 *  choices. Spamming one action should be suboptimal.
 * ───────────────────────────────────────────────────── */

import type { Pet, PetPersonality, PetSpecies } from './pet-system';

/* ── Types ─────────────────────────────────────────── */

export type InteractionType = 'feed' | 'play' | 'pet';

export interface InteractionResult {
  success: boolean;
  pet: Pet;
  reaction: string;       // What the pet says/does
  statChanges: {
    mood: number;
    hunger: number;
    affinity: number;
  };
  cooldownMs: number;     // How long until next interaction of this type
  error?: string;
}

export interface CooldownState {
  feed: number;   // timestamp when cooldown expires
  play: number;
  pet: number;
}

/* ── Cooldown Configuration (ms) ───────────────────── */

const COOLDOWNS: Record<InteractionType, number> = {
  feed: 30_000,   // 30s between feeds
  play: 20_000,   // 20s between plays
  pet: 10_000,    // 10s between pets
};

/* ── Diminishing Returns ─────────────────────────────
 *  Each successive interaction of the same type within
 *  a short window gives less benefit. Prevents spam.
 * ───────────────────────────────────────────────────── */

const INTERACTION_WINDOW = 5 * 60 * 1000; // 5 minutes

interface InteractionLog {
  type: InteractionType;
  timestamp: number;
}

// In-memory log (resets on popup close — that's fine)
const interactionLog: InteractionLog[] = [];

function getRecentCount(type: InteractionType): number {
  const now = Date.now();
  const cutoff = now - INTERACTION_WINDOW;
  // Prune old entries
  while (interactionLog.length > 0 && interactionLog[0].timestamp < cutoff) {
    interactionLog.shift();
  }
  return interactionLog.filter((e) => e.type === type).length;
}

function getDiminishingMultiplier(type: InteractionType): number {
  const count = getRecentCount(type);
  // 1st: 100%, 2nd: 75%, 3rd: 50%, 4th+: 25%
  if (count <= 0) return 1.0;
  if (count === 1) return 0.75;
  if (count === 2) return 0.5;
  return 0.25;
}

/* ── Personality Reactions ─────────────────────────── */

const FEED_REACTIONS: Record<PetPersonality, string[]> = {
  lively: ['Yummy! 🍖', 'More more more!', 'Delicious! *wag wag*'],
  calm: ['*quietly munches*', 'Thank you.', 'Satisfied.'],
  tsundere: ['I-It\'s not like I was hungry...', 'Hmph. Acceptable.', 'Don\'t think this means I like you!'],
  gentle: ['Thank you so much! 🥺', 'You\'re so kind...', '*happy munching*'],
  funny: ['Is this organic? Just kidding, NOM!', 'Food critic rating: 5 stars!', '*dramatic eating noises*'],
  genki: ['FOOD!!! 🎉', 'Energy restored!! Let\'s GO!', '*bounces while eating*'],
  scholar: ['Nutritional analysis: adequate.', 'Fuel for productivity.', 'Protein intake noted.'],
};

const PLAY_REACTIONS: Record<PetPersonality, string[]> = {
  lively: ['Again again again!', 'BEST GAME EVER!', '*zooms around*'],
  calm: ['That was... pleasant.', '*gentle play*', 'I enjoyed that.'],
  tsundere: ['I-I was just bored, okay?!', 'Don\'t get the wrong idea!', '...that was kinda fun.'],
  gentle: ['That was lovely! 💕', 'I love playing with you!', '*happy wiggle*'],
  funny: ['I let you win! Maybe. 😏', 'Did you see my move? EPIC!', '*trips over own paws*'],
  genki: ['WOOO! Again! Again!', 'I\'m UNSTOPPABLE!', '*victory dance*'],
  scholar: ['Physical activity: beneficial for mood.', 'Endorphins released. Optimal.', 'Play session logged.'],
};

const PET_REACTIONS: Record<PetPersonality, string[]> = {
  lively: ['*wiggles excitedly*', 'MORE PETS!', '*rolls over for belly rub*'],
  calm: ['*soft purring*', '*leans into your hand*', '...warm.'],
  tsundere: ['...! *blushes*', 'I didn\'t say stop...', '*pretends to not enjoy it*'],
  gentle: ['*melts into your touch*', 'I feel so loved... 🥹', '*contented sigh*'],
  funny: ['That tickles! 😂', '*falls over dramatically*', 'Pet me harder! Wait what-'],
  genki: ['*TAIL WAGGING INTENSIFIES*', 'LOVE LOVE LOVE!', '*happy spins*'],
  scholar: ['Physical affection: noted.', 'Oxytocin levels rising. *purrs*', 'Acceptable contact duration.'],
};

/* ── Species-Specific Modifiers ─────────────────────── */

const SPECIES_TRAITS: Record<string, {
  feedBonus: number;    // Extra mood from feeding
  playBonus: number;    // Extra mood from playing
  petBonus: number;     // Extra mood from petting
  decayRate: number;    // Mood/hunger decay multiplier
}> = {
  shiba:    { feedBonus: 2, playBonus: 3, petBonus: 1, decayRate: 1.0 },
  cat:      { feedBonus: 1, playBonus: 1, petBonus: 4, decayRate: 0.8 },  // Cats love pets, slow decay
  rabbit:   { feedBonus: 3, playBonus: 2, petBonus: 2, decayRate: 1.2 },  // Rabbits eat more, fast decay
  fox:      { feedBonus: 2, playBonus: 4, petBonus: 1, decayRate: 1.1 },  // Foxes love playing
};

/* ── Cooldown Check ─────────────────────────────────── */

export function getCooldownRemaining(type: InteractionType, cooldowns: CooldownState): number {
  return Math.max(0, cooldowns[type] - Date.now());
}

export function isOnCooldown(type: InteractionType, cooldowns: CooldownState): boolean {
  return getCooldownRemaining(type, cooldowns) > 0;
}

/* ── Execute Interaction ────────────────────────────── */

export function executeInteraction(
  pet: Pet,
  type: InteractionType,
  cooldowns: CooldownState,
): InteractionResult {
  // Check cooldown
  if (isOnCooldown(type, cooldowns)) {
    const remaining = getCooldownRemaining(type, cooldowns);
    return {
      success: false,
      pet,
      reaction: `${type === 'feed' ? '🍖' : type === 'play' ? '⚽' : '🤲'} Not ready yet!`,
      statChanges: { mood: 0, hunger: 0, affinity: 0 },
      cooldownMs: remaining,
      error: `Cooldown: ${Math.ceil(remaining / 1000)}s`,
    };
  }

  const multiplier = getDiminishingMultiplier(type);
  const traits = SPECIES_TRAITS[pet.species] || SPECIES_TRAITS.shiba;

  let moodChange = 0;
  let hungerChange = 0;
  let affinityChange = 0;

  switch (type) {
    case 'feed': {
      if (pet.food <= 0) {
        return {
          success: false,
          pet,
          reaction: 'No food left! Complete focus sessions to earn food.',
          statChanges: { mood: 0, hunger: 0, affinity: 0 },
          cooldownMs: 0,
          error: 'No food',
        };
      }
      if (pet.hunger >= 95) {
        return {
          success: false,
          pet,
          reaction: 'I\'m already full! 😊',
          statChanges: { mood: 0, hunger: 0, affinity: 0 },
          cooldownMs: 0,
          error: 'Already full',
        };
      }
      moodChange = Math.round((5 + traits.feedBonus) * multiplier);
      hungerChange = Math.round(20 * multiplier);
      affinityChange = Math.round(10 * multiplier);
      break;
    }
    case 'play': {
      moodChange = Math.round((15 + traits.playBonus) * multiplier);
      hungerChange = -Math.round(5 * multiplier); // Playing makes hungry
      affinityChange = Math.round(20 * multiplier);
      break;
    }
    case 'pet': {
      moodChange = Math.round((8 + traits.petBonus) * multiplier);
      hungerChange = 0;
      affinityChange = Math.round(15 * multiplier);
      break;
    }
  }

  // Clamp values
  const newMood = Math.min(100, Math.max(0, pet.mood + moodChange));
  const newHunger = Math.min(100, Math.max(0, pet.hunger + hungerChange));
  const newAffinity = Math.min(10000, pet.affinity + affinityChange);

  // Pick reaction based on personality
  const reactions = type === 'feed' ? FEED_REACTIONS
    : type === 'play' ? PLAY_REACTIONS
    : PET_REACTIONS;
  const personalityReactions = reactions[pet.personality] || reactions.lively;
  const reaction = personalityReactions[Math.floor(Math.random() * personalityReactions.length)];

  const updatedPet: Pet = {
    ...pet,
    mood: newMood,
    hunger: newHunger,
    affinity: newAffinity,
    food: type === 'feed' ? pet.food - 1 : pet.food,
    lastFedAt: type === 'feed' ? new Date().toISOString() : pet.lastFedAt,
    lastInteractedAt: new Date().toISOString(),
  };

  // Log interaction for diminishing returns
  interactionLog.push({ type, timestamp: Date.now() });

  return {
    success: true,
    pet: updatedPet,
    reaction,
    statChanges: {
      mood: moodChange,
      hunger: hungerChange,
      affinity: affinityChange,
    },
    cooldownMs: COOLDOWNS[type],
  };
}

/* ── Stat Decay (called during focus sessions) ─────── */

export function applyStatDecay(pet: Pet, minutesElapsed: number): Pet {
  const traits = SPECIES_TRAITS[pet.species] || SPECIES_TRAITS.shiba;

  // Mood decays slowly (1 per 5 min base)
  const moodDecay = Math.floor(minutesElapsed / 5) * traits.decayRate;

  // Hunger increases (1 per 3 min base)
  const hungerIncrease = Math.floor(minutesElapsed / 3) * traits.decayRate;

  return {
    ...pet,
    mood: Math.max(0, Math.round(pet.mood - moodDecay)),
    hunger: Math.min(100, Math.round(pet.hunger + hungerIncrease)),
  };
}

/* ── Idle Decay (called when popup opens, checks time since last interaction) ── */

export function applyIdleDecay(pet: Pet): Pet {
  if (!pet.lastInteractedAt) return pet;

  const now = Date.now();
  const lastInteract = new Date(pet.lastInteractedAt).getTime();
  const minutesSince = Math.floor((now - lastInteract) / 60_000);

  if (minutesSince < 10) return pet; // No decay for first 10 min

  const traits = SPECIES_TRAITS[pet.species] || SPECIES_TRAITS.shiba;

  // Mood decays: -1 per 30 min of neglect, capped at -30
  const moodDecay = Math.min(30, Math.floor(minutesSince / 30) * traits.decayRate);

  // Hunger increases: +1 per 20 min of neglect, capped at +50
  const hungerIncrease = Math.min(50, Math.floor(minutesSince / 20) * traits.decayRate);

  return {
    ...pet,
    mood: Math.max(0, Math.round(pet.mood - moodDecay)),
    hunger: Math.min(100, Math.round(pet.hunger + hungerIncrease)),
  };
}

/* ── Interaction Animation State ────────────────────── */

export type PetInteractionState = 'idle' | 'eating' | 'playing' | 'petting' | 'happy' | 'sad';

export function getInteractionAnimation(type: InteractionType): PetInteractionState {
  switch (type) {
    case 'feed': return 'eating';
    case 'play': return 'playing';
    case 'pet': return 'petting';
  }
}

export function getAnimationDuration(type: InteractionType): number {
  switch (type) {
    case 'feed': return 2000;  // 2s eating animation
    case 'play': return 2500;  // 2.5s playing animation
    case 'pet': return 1500;   // 1.5s petting animation
  }
}
