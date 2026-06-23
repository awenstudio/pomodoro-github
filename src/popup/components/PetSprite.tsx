/* ─────────────────────────────────────────────────────
 *  PetSprite — Frame-by-frame sprite animation using
 *  AI-generated pet illustrations. Supports idle,
 *  walk, hatch, focus, rest, relax animations.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useCallback, useRef } from 'react';

export type AnimationType = 'idle' | 'walk' | 'hatch' | 'focus' | 'rest' | 'relax' | 'static';

interface PetSpriteProps {
  /** Pet species key (e.g. 'shiba-inu', 'cat') */
  species: string;
  /** Which animation to play */
  animation: AnimationType;
  /** Sprite size in px (default 128) */
  size?: number;
  /** Extra CSS classes */
  className?: string;
  /** Animation speed in ms per frame */
  frameRate?: number;
  /** Called when hatch animation completes */
  onHatchComplete?: () => void;
}

/* ── Animation frame sets (served from public/) ──── */

// Species-specific animation frames
const SPECIES_ANIMATIONS: Record<string, Record<string, string[]>> = {
  'shiba-inu': {
    idle: [
      '/animations/shiba-inu-idle-01.png',
      '/animations/shiba-inu-idle-02.png',
      '/animations/shiba-inu-idle-03.png',
      '/animations/shiba-inu-idle-02.png',
    ],
    walk: [
      '/animations/shiba-inu-walk-01.png',
      '/animations/shiba-inu-walk-02.png',
    ],
    focus: [
      '/animations/shiba-inu-idle-01.png',   // sitting alert
      '/animations/shiba-inu-idle-02.png',   // standing
      '/animations/shiba-inu-idle-01.png',
    ],
    rest: [
      '/animations/shiba-inu-idle-03.png',   // lying down relaxed
      '/animations/shiba-inu-idle-03.png',
    ],
    relax: [
      '/animations/shiba-inu-walk-01.png',   // playful walking
      '/animations/shiba-inu-walk-02.png',
      '/animations/shiba-inu-idle-02.png',   // standing happy
    ],
    hatch: [
      '/animations/egg-01.png',
      '/animations/egg-02.png',
      '/animations/egg-03.png',
      '/animations/egg-04.png',
      '/animations/egg-05.png',
    ],
  },
  'cat': {
    idle: [
      '/animations/cat-idle-01.png',
      '/animations/cat-idle-02.png',
      '/animations/cat-idle-03.png',
      '/animations/cat-idle-02.png',
    ],
    walk: [
      '/animations/cat-walk-01.png',
      '/animations/cat-walk-02.png',
    ],
    focus: [
      '/animations/cat-idle-01.png',
      '/animations/cat-idle-02.png',
      '/animations/cat-idle-01.png',
    ],
    rest: [
      '/animations/cat-idle-03.png',
      '/animations/cat-idle-03.png',
    ],
    relax: [
      '/animations/cat-walk-01.png',
      '/animations/cat-walk-02.png',
      '/animations/cat-idle-02.png',
    ],
    hatch: [
      '/animations/egg-01.png',
      '/animations/egg-02.png',
      '/animations/egg-03.png',
      '/animations/egg-04.png',
      '/animations/egg-05.png',
    ],
  },
  'rabbit': {
    idle: [
      '/animations/rabbit-idle-01.png',
      '/animations/rabbit-idle-02.png',
      '/animations/rabbit-idle-03.png',
      '/animations/rabbit-idle-02.png',
    ],
    walk: [
      '/animations/rabbit-walk-01.png',
      '/animations/rabbit-walk-02.png',
    ],
    focus: [
      '/animations/rabbit-idle-01.png',
      '/animations/rabbit-idle-02.png',
      '/animations/rabbit-idle-01.png',
    ],
    rest: [
      '/animations/rabbit-idle-03.png',
      '/animations/rabbit-idle-03.png',
    ],
    relax: [
      '/animations/rabbit-walk-01.png',
      '/animations/rabbit-walk-02.png',
      '/animations/rabbit-idle-02.png',
    ],
    hatch: [
      '/animations/egg-01.png',
      '/animations/egg-02.png',
      '/animations/egg-03.png',
      '/animations/egg-04.png',
      '/animations/egg-05.png',
    ],
  },
  'fox': {
    idle: [
      '/animations/fox-idle-01.png',
      '/animations/fox-idle-02.png',
      '/animations/fox-idle-03.png',
      '/animations/fox-idle-02.png',
    ],
    walk: [
      '/animations/fox-walk-01.png',
      '/animations/fox-walk-02.png',
    ],
    focus: [
      '/animations/fox-idle-01.png',
      '/animations/fox-idle-02.png',
      '/animations/fox-idle-01.png',
    ],
    rest: [
      '/animations/fox-idle-03.png',
      '/animations/fox-idle-03.png',
    ],
    relax: [
      '/animations/fox-walk-01.png',
      '/animations/fox-walk-02.png',
      '/animations/fox-idle-02.png',
    ],
    hatch: [
      '/animations/egg-01.png',
      '/animations/egg-02.png',
      '/animations/egg-03.png',
      '/animations/egg-04.png',
      '/animations/egg-05.png',
    ],
  },
};

// Fallback for unknown species
const FALLBACK_ANIMATIONS: Record<string, string[]> = {
  idle: [
    '/animations/idle-01.png',
    '/animations/idle-02.png',
    '/animations/idle-03.png',
    '/animations/idle-02.png',
  ],
  walk: [
    '/animations/walk-01.png',
    '/animations/walk-02.png',
  ],
  focus: [
    '/animations/idle-01.png',
    '/animations/idle-02.png',
    '/animations/idle-01.png',
  ],
  rest: [
    '/animations/idle-03.png',
    '/animations/idle-03.png',
  ],
  relax: [
    '/animations/walk-01.png',
    '/animations/walk-02.png',
    '/animations/idle-02.png',
  ],
  hatch: [
    '/animations/egg-01.png',
    '/animations/egg-02.png',
    '/animations/egg-03.png',
    '/animations/egg-04.png',
    '/animations/egg-05.png',
  ],
};

function getFrames(species: string, animation: AnimationType): string[] {
  const speciesAnims = SPECIES_ANIMATIONS[species] || {};
  return speciesAnims[animation] || FALLBACK_ANIMATIONS[animation] || FALLBACK_ANIMATIONS.idle;
}

/* ── CSS classes for animation effects ──── */
const ANIMATION_CLASSES: Partial<Record<AnimationType, string>> = {
  idle: 'animate-float',
  walk: 'animate-bounce-subtle',
  focus: 'animate-pulse-soft',
  rest: 'animate-fade-in',
  relax: 'animate-float',
  hatch: 'animate-scale-in',
  static: '',
};

export function PetSprite({
  species,
  animation,
  size = 128,
  className = '',
  frameRate = 600,
  onHatchComplete,
}: PetSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('');
  const framesRef = useRef<string[]>([]);
  const isHatching = animation === 'hatch';

  const frames = getFrames(species, animation);
  framesRef.current = frames;

  // Preload images
  useEffect(() => {
    setImagesLoaded(false);
    setCurrentFrame(0);
    const urls = frames;
    Promise.all(
      urls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // don't block on missing images
            img.src = url;
          }),
      ),
    ).then(() => {
      setImagesLoaded(true);
    });
  }, [species, animation]);

  // Set initial image when frames change
  useEffect(() => {
    if (frames.length > 0) {
      setImgSrc(frames[0]);
    }
  }, [frames]);

  // Frame loop
  useEffect(() => {
    if (!imagesLoaded || frames.length === 0) return;

    const timer = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = (prev + 1) % frames.length;
        setImgSrc(frames[next]);

        // If hatch animation completed a full cycle
        if (isHatching && next === 0 && onHatchComplete) {
          onHatchComplete();
        }

        return next;
      });
    }, frameRate);

    return () => clearInterval(timer);
  }, [imagesLoaded, frames, frameRate, isHatching, onHatchComplete]);

  const animClass = ANIMATION_CLASSES[animation] || '';

  return (
    <div
      className={`pet-sprite ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={imgSrc}
        alt={`Pet ${animation}`}
        className={`w-full h-full object-contain transition-opacity duration-300 ${animClass} ${
          imagesLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        draggable={false}
      />
    </div>
  );
}
