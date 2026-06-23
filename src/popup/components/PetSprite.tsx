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

/* ── Animation frame sets ──── */
function getFrames(species: string, animation: AnimationType): string[] {
  const filePrefix = SPECIES_FILE[species] || species;

  // Static: show portrait
  if (animation === 'static') {
    return [PORTRAITS[species] || PORTRAITS['shiba']];
  }

  // Build frame list from species-specific files
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
      // Focus = alert sitting (idle-01 + idle-02)
      frames.push(`/animations/${filePrefix}-idle-01.png`);
      frames.push(`/animations/${filePrefix}-idle-02.png`);
      frames.push(`/animations/${filePrefix}-idle-01.png`);
      break;
    case 'rest':
      // Rest = lying down (idle-03)
      frames.push(`/animations/${filePrefix}-idle-03.png`);
      frames.push(`/animations/${filePrefix}-idle-03.png`);
      break;
    case 'relax':
      // Relax = playful walking
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
