/* ─────────────────────────────────────────────────────
 *  PetSprite — Frame-by-frame sprite animation using
 *  AI-generated pet illustrations. Supports idle,
 *  walk, and hatch animations.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useRef } from 'react';

export type AnimationType = 'idle' | 'walk' | 'hatch' | 'static';

interface PetSpriteProps {
  /** Current pet species for static fallback */
  species?: string;
  /** Which animation to play */
  animation: AnimationType;
  /** Frame size in pixels */
  size?: number;
  /** Animation speed in ms per frame */
  speed?: number;
  /** Called when hatch animation completes */
  onHatchComplete?: () => void;
  /** CSS class */
  className?: string;
}

/* ── Animation frame sets (served from public/) ──── */

const ANIMATION_FRAMES: Record<string, string[]> = {
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
  hatch: [
    '/animations/egg-01.png',
    '/animations/egg-02.png',
    '/animations/egg-03.png',
    '/animations/egg-04.png',
    '/animations/egg-05.png',
  ],
};

const PET_IMAGES: Record<string, string> = {
  shiba: '/pets/shiba-inu.png',
  cat: '/pets/cat.png',
  rabbit: '/pets/rabbit.png',
  fox: '/pets/fox.png',
  penguin: '/pets/penguin.png',
  panda: '/pets/panda.png',
  dragon: '/pets/dragon.png',
  robot: '/pets/robot.png',
  alien: '/pets/alien.png',
};

const SPEEDS: Record<AnimationType, number> = {
  idle: 800,
  walk: 400,
  hatch: 600,
  static: 0,
};

export function PetSprite({
  species = 'shiba',
  animation,
  size = 128,
  speed,
  onHatchComplete,
  className = '',
}: PetSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [hatchDone, setHatchDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const frames = animation === 'static'
    ? [PET_IMAGES[species] || PET_IMAGES.shiba]
    : ANIMATION_FRAMES[animation] || ANIMATION_FRAMES.idle;

  const frameSpeed = speed || SPEEDS[animation];

  // Preload images
  useEffect(() => {
    let mounted = true;
    const imgs = frames.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    // Wait for first frame to load
    if (imgs[0]) {
      imgs[0].onload = () => {
        if (mounted) setLoaded(true);
      };
      imgs[0].onerror = () => {
        if (mounted) setLoaded(true); // show anyway
      };
    } else {
      setLoaded(true);
    }
    return () => { mounted = false; };
  }, [frames]);

  // Animation loop
  useEffect(() => {
    if (animation === 'static' || !loaded) return;

    intervalRef.current = setInterval(() => {
      setFrameIndex((prev) => {
        const next = prev + 1;
        if (next >= frames.length) {
          if (animation === 'hatch') {
            setHatchDone(true);
            clearInterval(intervalRef.current);
            return frames.length - 1; // stay on last frame
          }
          return 0; // loop
        }
        return next;
      });
    }, frameSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [animation, loaded, frames.length, frameSpeed]);

  // Notify on hatch complete
  useEffect(() => {
    if (hatchDone && onHatchComplete) {
      const timer = setTimeout(onHatchComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [hatchDone, onHatchComplete]);

  const currentSrc = frames[frameIndex] || frames[0];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ width: size, height: size }}
    >
      {loaded ? (
        <img
          src={currentSrc}
          alt="Pet"
          className="w-full h-full object-cover transition-opacity duration-150"
          style={{
            imageRendering: 'auto',
            opacity: loaded ? 1 : 0,
          }}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-2 rounded-2xl">
          <span className="text-3xl animate-bounce-gentle">🐾</span>
        </div>
      )}

      {/* Soft vignette overlay */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 20px rgba(26,24,20,0.3)',
        }}
      />
    </div>
  );
}
