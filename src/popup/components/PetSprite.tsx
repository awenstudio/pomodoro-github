/* ─────────────────────────────────────────────────────
 *  PetSprite — Frame-by-frame sprite animation using
 *  AI-generated pet illustrations. Supports idle,
 *  walk, hatch, focus, rest, relax animations.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useRef } from 'react';

export type AnimationType = 'idle' | 'walk' | 'hatch' | 'focus' | 'rest' | 'relax' | 'static';

interface PetSpriteProps {
  species: string;
  animation: AnimationType;
  size?: number;
  className?: string;
  frameRate?: number;
  onHatchComplete?: () => void;
}

/* ── Species name mapping (UI key → file prefix) ──── */
const SPECIES_FILE: Record<string, string> = {
  'shiba': 'shiba-inu',
  'shiba-inu': 'shiba-inu',
  'cat': 'cat',
  'rabbit': 'rabbit',
  'fox': 'fox',
};

/* ── Portrait files for static display ──── */
const PORTRAITS: Record<string, string> = {
  'shiba': '/pets/shiba-inu.png',
  'shiba-inu': '/pets/shiba-inu.png',
  'cat': '/pets/cat.png',
  'rabbit': '/pets/rabbit.png',
  'fox': '/pets/fox.png',
};

/* ── Timer state → pet state image mapping ──── */
// Maps (species, timerAnimation) to specific state image filenames
const STATE_MAP: Record<string, Record<string, string>> = {
  shiba: {
    focus: '/pets/shiba-inu-standing.png',
    rest: '/pets/shiba-inu-sleeping.png',
    relax: '/pets/shiba-inu-happy.png',
    idle: '/pets/shiba-inu-sitting.png',
    walk: '/pets/shiba-inu-following.png',
    hatch: '/pets/shiba-inu-from-box.png',
    static: '/pets/shiba-inu.png',
  },
  cat: {
    focus: '/pets/cat-standing.png',
    rest: '/pets/cat-sleeping.png',
    relax: '/pets/cat-happy.png',
    idle: '/pets/cat-sitting.png',
    walk: '/pets/cat-standing.png',
    hatch: '/pets/cat-from-box.png',
    static: '/pets/cat.png',
  },
  rabbit: {
    focus: '/pets/rabbit-standing.png',
    rest: '/pets/rabbit-sleeping.png',
    relax: '/pets/rabbit-happy.png',
    idle: '/pets/rabbit-sitting.png',
    walk: '/pets/rabbit-standing.png',
    hatch: '/pets/rabbit-from-box.png',
    static: '/pets/rabbit.png',
  },
  fox: {
    focus: '/pets/fox-standing.png',
    rest: '/pets/fox-sleeping.png',
    relax: '/pets/fox-happy.png',
    idle: '/pets/fox-sitting.png',
    walk: '/pets/fox-standing.png',
    hatch: '/pets/fox-from-box.png',
    static: '/pets/fox.png',
  },
};

/* ── Animation frame sets ──── */
function getFrames(species: string, animation: AnimationType): string[] {
  const filePrefix = SPECIES_FILE[species] || species;

  // Check state map first — if we have a state image, use it as single frame
  const stateMap = STATE_MAP[species];
  if (stateMap && stateMap[animation]) {
    return [stateMap[animation]];
  }

  // Static: show portrait
  if (animation === 'static') {
    return [PORTRAITS[species] || PORTRAITS['shiba']];
  }

  // Build frame list from species-specific animation files
  const frames: string[] = [];
  switch (animation) {
    case 'idle':
      for (let i = 1; i <= 3; i++) frames.push(`/animations/${filePrefix}-idle-0${i}.png`);
      break;
    case 'walk':
      for (let i = 1; i <= 2; i++) frames.push(`/animations/${filePrefix}-walk-0${i}.png`);
      break;
    case 'hatch':
      for (let i = 1; i <= 5; i++) frames.push(`/animations/${filePrefix}-hatch-0${i}.png`);
      break;
    case 'focus':
      frames.push(`/animations/${filePrefix}-idle-01.png`);
      frames.push(`/animations/${filePrefix}-idle-02.png`);
      frames.push(`/animations/${filePrefix}-idle-01.png`);
      break;
    case 'rest':
      frames.push(`/animations/${filePrefix}-idle-03.png`);
      frames.push(`/animations/${filePrefix}-idle-03.png`);
      break;
    case 'relax':
      frames.push(`/animations/${filePrefix}-walk-01.png`);
      frames.push(`/animations/${filePrefix}-walk-02.png`);
      frames.push(`/animations/${filePrefix}-idle-02.png`);
      break;
    default:
      return [`/pets/${filePrefix}.png`];
  }

  return frames.length > 0 ? frames : [`/pets/${filePrefix}.png`];
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
    Promise.all(
      frames.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
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
