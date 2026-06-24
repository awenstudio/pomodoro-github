/* ─────────────────────────────────────────────────────
 *  PetRoom — QQ Pet-style interactive room scene.
 *
 *  Pet lives in a cozy room with furniture it can
 *  interact with. Pet position changes based on timer
 *  state (desk during focus, bed during rest, etc).
 *
 *  Furniture: Study Desk, Bed, Food Bowl, Toy Box,
 *  Bookshelf, Plant, Window, Rug.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react';
import { PetSprite } from './PetSprite';
import type { AnimationType } from './PetSprite';
import type { Pet } from '@/lib/pet-system';

/* ── Types ─────────────────────────────────────────── */

export type TimerActivity = 'focus' | 'rest' | 'relax' | 'idle';
export type InteractionType = 'feed' | 'play' | 'pet' | 'study';

interface PetRoomProps {
  pet: Pet;
  activity: TimerActivity;
  isRunning: boolean;
  petAnimOverride?: AnimationType | null;
  petReaction?: string | null;
  onFurnitureClick?: (id: string) => void;
}

/* ── Furniture definitions with positions ──────────── */

interface Furniture {
  id: string;
  name: string;
  emoji: string;
  x: number;       // % from left
  y: number;       // % from top
  w: number;       // width %
  h: number;       // height %
  activity?: TimerActivity; // When does pet go here?
  interactable: boolean;
  description: string;
}

const FURNITURE: Furniture[] = [
  { id: 'desk', name: 'Study Desk', emoji: '📚', x: 5, y: 25, w: 28, h: 35, activity: 'focus', interactable: true, description: 'Focus time!' },
  { id: 'bed', name: 'Cozy Bed', emoji: '🛏️', x: 67, y: 20, w: 28, h: 35, activity: 'rest', interactable: true, description: 'Rest & recharge' },
  { id: 'food', name: 'Food Bowl', emoji: '🍖', x: 5, y: 65, w: 20, h: 20, interactable: true, description: 'Feed your pet' },
  { id: 'toy', name: 'Toy Box', emoji: '🧸', x: 38, y: 65, w: 20, h: 20, interactable: true, description: 'Play together' },
  { id: 'bookshelf', name: 'Bookshelf', emoji: '📖', x: 67, y: 65, w: 28, h: 20, activity: 'relax', interactable: true, description: 'Browse books' },
  { id: 'plant', name: 'Plant', emoji: '🌿', x: 88, y: 15, w: 10, h: 15, interactable: false, description: '' },
  { id: 'window', name: 'Window', emoji: '🪟', x: 38, y: 5, w: 24, h: 18, interactable: false, description: '' },
  { id: 'rug', name: 'Rug', emoji: '🟫', x: 30, y: 40, w: 40, h: 25, interactable: false, description: '' },
];

/* ── Pet position based on activity ────────────────── */

function getPetPosition(activity: TimerActivity, isRunning: boolean): { x: number; y: number } {
  switch (activity) {
    case 'focus': return { x: 19, y: 40 };   // At desk
    case 'rest':  return { x: 81, y: 35 };   // On bed
    case 'relax': return { x: 81, y: 70 };   // Near bookshelf
    case 'idle':  return { x: 48, y: 52 };   // Center rug
  }
}

function getPetAnimation(activity: TimerActivity, isRunning: boolean, override?: AnimationType | null): AnimationType {
  if (override) return override;
  if (!isRunning && activity === 'idle') return 'idle';
  switch (activity) {
    case 'focus': return 'focus';
    case 'rest':  return 'rest';
    case 'relax': return 'relax';
    default:      return 'idle';
  }
}

/* ── Mood emoji ────────────────────────────────────── */

function getMoodEmoji(mood: number): string {
  if (mood >= 80) return '😊';
  if (mood >= 60) return '🙂';
  if (mood >= 40) return '😐';
  if (mood >= 20) return '😢';
  return '😿';
}

/* ── Component ─────────────────────────────────────── */

export function PetRoom({
  pet,
  activity,
  isRunning,
  petAnimOverride,
  petReaction,
  onFurnitureClick,
}: PetRoomProps) {
  const [hoveredFurniture, setHoveredFurniture] = useState<string | null>(null);
  const [petPos, setPetPos] = useState(getPetPosition(activity, isRunning));
  const targetPos = useRef(getPetPosition(activity, isRunning));

  // Smooth pet movement to target position
  useEffect(() => {
    targetPos.current = getPetPosition(activity, isRunning);
    const interval = setInterval(() => {
      setPetPos((prev) => {
        const tx = targetPos.current.x;
        const ty = targetPos.current.y;
        const dx = tx - prev.x;
        const dy = ty - prev.y;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
          clearInterval(interval);
          return { x: tx, y: ty };
        }
        return {
          x: prev.x + dx * 0.08,
          y: prev.y + dy * 0.08,
        };
      });
    }, 50);
    return () => clearInterval(interval);
  }, [activity, isRunning]);

  const anim = getPetAnimation(activity, isRunning, petAnimOverride);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        height: 220,
        background: 'linear-gradient(180deg, #2A2520 0%, #1F1C18 60%, #181614 100%)',
        border: '1px solid rgba(255,248,230,0.06)',
        boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.3), 0 4px 24px rgba(0,0,0,0.2)',
      }}
    >
      {/* Room ambient light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, rgba(255,220,150,0.04) 0%, transparent 60%)',
        }}
      />

      {/* Window light rays */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '38%', top: '5%', width: '24%', height: '40%',
          background: 'linear-gradient(180deg, rgba(255,220,150,0.06) 0%, transparent 100%)',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Floor line */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: '55%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,248,230,0.04), transparent)',
        }}
      />

      {/* Wall texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,248,230,0.01) 49px, rgba(255,248,230,0.01) 50px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Furniture */}
      {FURNITURE.map((f) => (
        <div
          key={f.id}
          className="absolute transition-all duration-300"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: `${f.w}%`,
            height: `${f.h}%`,
            zIndex: f.id === 'rug' ? 1 : 2,
          }}
          onMouseEnter={() => f.interactable && setHoveredFurniture(f.id)}
          onMouseLeave={() => setHoveredFurniture(null)}
          onClick={() => f.interactable && onFurnitureClick?.(f.id)}
        >
          {/* Furniture visual */}
          <div
            className="w-full h-full flex items-center justify-center rounded-lg transition-all duration-200"
            style={{
              background: f.id === 'rug'
                ? 'rgba(255,248,230,0.02)'
                : f.id === 'window'
                  ? 'linear-gradient(180deg, rgba(123,168,209,0.08) 0%, rgba(123,168,209,0.02) 100%)'
                  : 'rgba(255,248,230,0.03)',
              border: f.id === 'rug'
                ? 'none'
                : f.id === 'window'
                  ? '1px solid rgba(123,168,209,0.1)'
                  : hoveredFurniture === f.id
                    ? '1px solid rgba(255,248,230,0.12)'
                    : '1px solid rgba(255,248,230,0.04)',
              boxShadow: hoveredFurniture === f.id
                ? '0 0 16px rgba(255,220,150,0.08)'
                : 'none',
              cursor: f.interactable ? 'pointer' : 'default',
              transform: hoveredFurniture === f.id ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <span className="text-xl select-none" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>
              {f.emoji}
            </span>
          </div>

          {/* Tooltip on hover */}
          {hoveredFurniture === f.id && f.interactable && (
            <div
              className="absolute left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[9px] font-display text-cream-200 whitespace-nowrap z-50"
              style={{
                bottom: '105%',
                background: 'rgba(31,28,24,0.95)',
                border: '1px solid rgba(255,248,230,0.1)',
                backdropFilter: 'blur(8px)',
                animation: 'rewardSlideUp 0.15s ease-out',
              }}
            >
              {f.name}
              <span className="text-cream-400/40 ml-1">{f.description}</span>
            </div>
          )}
        </div>
      ))}

      {/* Pet */}
      <div
        className="absolute transition-all duration-700 ease-out"
        style={{
          left: `${petPos.x}%`,
          top: `${petPos.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}
      >
        <PetSprite
          species={pet.species}
          animation={anim}
          size={64}
          className="drop-shadow-lg"
        />

        {/* Pet name tag */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-[9px] font-display text-cream-300/60 whitespace-nowrap"
          style={{ bottom: -14 }}
        >
          {pet.name} {getMoodEmoji(pet.mood)}
        </div>

        {/* Reaction bubble */}
        {petReaction && (
          <div
            className="absolute left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl text-[10px] font-display text-cream-200 whitespace-nowrap z-20"
            style={{
              bottom: '110%',
              background: 'rgba(31,28,24,0.95)',
              border: '1px solid rgba(255,248,230,0.1)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              animation: 'rewardSlideUp 0.2s ease-out',
            }}
          >
            {petReaction}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
              style={{
                bottom: -4,
                background: 'rgba(31,28,24,0.95)',
                borderRight: '1px solid rgba(255,248,230,0.1)',
                borderBottom: '1px solid rgba(255,248,230,0.1)',
              }}
            />
          </div>
        )}
      </div>

      {/* Room label */}
      <div
        className="absolute bottom-2 left-3 text-[8px] font-display text-cream-400/20 uppercase tracking-widest"
      >
        {activity === 'focus' ? '📚 Study' : activity === 'rest' ? '🛏️ Bedroom' : activity === 'relax' ? '📖 Library' : '🏠 Living Room'}
      </div>

      {/* Ambient particles */}
      {isRunning && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full pointer-events-none"
              style={{
                left: `${30 + i * 20}%`,
                bottom: '30%',
                background: 'rgba(255,220,150,0.15)',
                animation: `float ${3 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
