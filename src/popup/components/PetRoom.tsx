/* ─────────────────────────────────────────────────────
 *  PetRoom v4 — Cozy warm room redesign.
 *  Cream walls, wood floor, colorful furniture.
 *  QQ Pet vibes: bright, lively, actually visible.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useRef } from 'react';
import { PetSprite } from './PetSprite';
import type { AnimationType } from './PetSprite';
import type { Pet } from '@/lib/pet-system';
import {
  IconDesk, IconBed, IconFoodBowl, IconToyBox, IconBookshelf,
  IconPlant, IconWindow, IconRug,
} from '@/lib/icons';

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

/* ── Furniture definitions ──────────────────────────── */

interface Furniture {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  w: number;
  h: number;
  activity?: TimerActivity;
  interactable: boolean;
  description: string;
  iconSize: number;
}

const FURNITURE_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  desk: IconDesk,
  bed: IconBed,
  food: IconFoodBowl,
  toy: IconToyBox,
  bookshelf: IconBookshelf,
  plant: IconPlant,
  window: IconWindow,
  rug: IconRug,
};

/* ── Per-furniture visual style (bg + border + glow) ── */

interface FurnitureStyle {
  bg: string;
  border: string;
  hoverBorder: string;
  shadow: string;
  hoverShadow: string;
}

const FURNITURE_STYLE: Record<string, FurnitureStyle> = {
  desk: {
    bg: 'linear-gradient(145deg, #B08060 0%, #8A5C30 55%, #6A4018 100%)',
    border: '1.5px solid rgba(70,38,10,0.55)',
    hoverBorder: '1.5px solid rgba(176,128,96,0.8)',
    shadow: '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
    hoverShadow: '0 0 18px rgba(176,128,96,0.55), 0 2px 8px rgba(0,0,0,0.3)',
  },
  bed: {
    bg: 'linear-gradient(145deg, #EAB0CE 0%, #CC88B0 55%, #AA6898 100%)',
    border: '1.5px solid rgba(150,72,122,0.4)',
    hoverBorder: '1.5px solid rgba(234,176,206,0.8)',
    shadow: '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
    hoverShadow: '0 0 18px rgba(234,176,206,0.55), 0 2px 8px rgba(0,0,0,0.25)',
  },
  food: {
    bg: 'linear-gradient(145deg, #EC9858 0%, #CC7030 55%, #AC5010 100%)',
    border: '1.5px solid rgba(148,64,12,0.5)',
    hoverBorder: '1.5px solid rgba(236,152,88,0.8)',
    shadow: '0 2px 6px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.1)',
    hoverShadow: '0 0 16px rgba(236,152,88,0.55), 0 2px 6px rgba(0,0,0,0.25)',
  },
  toy: {
    bg: 'linear-gradient(145deg, #F2D458 0%, #D8B020 55%, #B89000 100%)',
    border: '1.5px solid rgba(150,108,0,0.4)',
    hoverBorder: '1.5px solid rgba(242,212,88,0.8)',
    shadow: '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
    hoverShadow: '0 0 16px rgba(242,212,88,0.6), 0 2px 6px rgba(0,0,0,0.22)',
  },
  bookshelf: {
    bg: 'linear-gradient(145deg, #905A38 0%, #6A3E20 55%, #4A2808 100%)',
    border: '1.5px solid rgba(52,24,4,0.6)',
    hoverBorder: '1.5px solid rgba(144,90,56,0.8)',
    shadow: '0 2px 6px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)',
    hoverShadow: '0 0 16px rgba(144,90,56,0.5), 0 2px 8px rgba(0,0,0,0.3)',
  },
  plant: {
    bg: 'linear-gradient(160deg, #80CC60 0%, #5CAA3C 55%, #3C8A20 100%)',
    border: '1.5px solid rgba(44,108,20,0.45)',
    hoverBorder: '1.5px solid rgba(128,204,96,0.8)',
    shadow: '0 2px 5px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
    hoverShadow: '0 0 14px rgba(128,204,96,0.5)',
  },
  window: {
    bg: 'linear-gradient(180deg, #C8EAFF 0%, #98CCEE 55%, #68AADD 100%)',
    border: '2px solid rgba(60,130,200,0.55)',
    hoverBorder: '2px solid rgba(100,170,240,0.8)',
    shadow: '0 0 12px rgba(150,210,255,0.5), inset 0 0 8px rgba(255,255,255,0.2)',
    hoverShadow: '0 0 24px rgba(150,210,255,0.7)',
  },
  rug: {
    bg: 'radial-gradient(ellipse at center, rgba(192,94,68,0.6) 0%, rgba(152,62,36,0.35) 55%, transparent 100%)',
    border: 'none',
    hoverBorder: 'none',
    shadow: 'none',
    hoverShadow: 'none',
  },
};

const FURNITURE: Furniture[] = [
  { id: 'desk',      name: 'Study Desk', emoji: '📚', x: 5,  y: 22, w: 28, h: 37, activity: 'focus',  interactable: true,  description: 'Focus time!',      iconSize: 40 },
  { id: 'bed',       name: 'Cozy Bed',   emoji: '🛏️', x: 67, y: 18, w: 28, h: 37, activity: 'rest',   interactable: true,  description: 'Rest & recharge',  iconSize: 40 },
  { id: 'food',      name: 'Food Bowl',  emoji: '🍖', x: 5,  y: 64, w: 20, h: 22, interactable: true,  description: 'Feed your pet',    iconSize: 28 },
  { id: 'toy',       name: 'Toy Box',    emoji: '🧸', x: 38, y: 64, w: 20, h: 22, interactable: true,  description: 'Play together',    iconSize: 28 },
  { id: 'bookshelf', name: 'Bookshelf',  emoji: '📖', x: 67, y: 64, w: 28, h: 22, activity: 'relax',  interactable: true,  description: 'Browse books',     iconSize: 32 },
  { id: 'plant',     name: 'Plant',      emoji: '🌿', x: 88, y: 12, w: 10, h: 18, interactable: false, description: '',                 iconSize: 20 },
  { id: 'window',    name: 'Window',     emoji: '🪟', x: 38, y: 4,  w: 24, h: 20, interactable: false, description: '',                 iconSize: 24 },
  { id: 'rug',       name: 'Rug',        emoji: '🟫', x: 28, y: 40, w: 44, h: 24, interactable: false, description: '',                 iconSize: 0  },
];

/* ── Pet position per activity ──────────────────────── */

function getPetPosition(activity: TimerActivity): { x: number; y: number } {
  switch (activity) {
    case 'focus':  return { x: 19, y: 42 };
    case 'rest':   return { x: 81, y: 35 };
    case 'relax':  return { x: 81, y: 72 };
    case 'idle':   return { x: 48, y: 55 };
  }
}

function getPetAnimation(activity: TimerActivity, isRunning: boolean, override?: AnimationType | null): AnimationType {
  if (override) return override;
  if (!isRunning) return 'idle';
  switch (activity) {
    case 'focus':  return 'focus';
    case 'rest':   return 'rest';
    case 'relax':  return 'relax';
    default:       return 'idle';
  }
}

function getMoodColor(mood: number): string {
  if (mood >= 80) return '#6FA85C';
  if (mood >= 60) return '#8BC47A';
  if (mood >= 40) return '#E89B52';
  if (mood >= 20) return '#E86868';
  return '#CC4444';
}

/* ── Activity label config ──────────────────────────── */

const ACTIVITY_CONFIG = {
  focus:  { label: 'Study',       dot: '#5AAF5E' },
  rest:   { label: 'Bedroom',     dot: '#7BA8D1' },
  relax:  { label: 'Library',     dot: '#FF8A8A' },
  idle:   { label: 'Living Room', dot: 'rgba(255,248,230,0.35)' },
};

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
  const [petPos, setPetPos] = useState(getPetPosition(activity));
  const targetPos = useRef(getPetPosition(activity));

  useEffect(() => {
    targetPos.current = getPetPosition(activity);
    const interval = setInterval(() => {
      setPetPos((prev) => {
        const tx = targetPos.current.x;
        const ty = targetPos.current.y;
        const dx = tx - prev.x;
        const dy = ty - prev.y;
        if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
          clearInterval(interval);
          return { x: tx, y: ty };
        }
        return { x: prev.x + dx * 0.08, y: prev.y + dy * 0.08 };
      });
    }, 50);
    return () => clearInterval(interval);
  }, [activity]);

  const anim = getPetAnimation(activity, isRunning, petAnimOverride);
  const activityCfg = ACTIVITY_CONFIG[activity];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        height: 224,
        border: '2px solid rgba(160,120,60,0.35)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,240,200,0.06)',
      }}
    >
      {/* ── Room wall (warm cream) ── */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #FDE8A4 0%, #F0D880 52%)' }}
      />

      {/* ── Subtle wallpaper stripe ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(200,158,40,0.07) 39px, rgba(200,158,40,0.07) 40px)',
          top: 0, bottom: '46%',
        }}
      />

      {/* ── Ceiling warm light ── */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '40%',
          background: 'radial-gradient(ellipse 70% 60% at 50% -10%, rgba(255,215,100,0.18) 0%, transparent 100%)',
        }}
      />

      {/* ── Floor (warm wood) ── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: '54%',
          background: 'linear-gradient(180deg, #C07840 0%, #8A5020 100%)',
        }}
      />

      {/* ── Floor wood grain ── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          top: '54%',
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(0,0,0,0.06) 23px, rgba(0,0,0,0.06) 24px)',
        }}
      />

      {/* ── Baseboard ── */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: '54%',
          height: 4,
          background: 'linear-gradient(90deg, #5A2E08, #7A4418, #5A2E08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
        }}
      />

      {/* ── Floor shadow (depth) ── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '12%',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.15), transparent)',
        }}
      />

      {/* ── Window light shaft ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '40%', top: '24%', width: '20%', height: '34%',
          background: 'linear-gradient(180deg, rgba(255,235,140,0.18) 0%, transparent 100%)',
          clipPath: 'polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* ── Furniture ── */}
      {FURNITURE.map((f) => {
        const style = FURNITURE_STYLE[f.id];
        const isHovered = hoveredFurniture === f.id;
        const isRug = f.id === 'rug';
        const isWindow = f.id === 'window';
        const Icon = FURNITURE_ICONS[f.id as keyof typeof FURNITURE_ICONS];

        return (
          <div
            key={f.id}
            className="absolute"
            style={{
              left: `${f.x}%`, top: `${f.y}%`,
              width: `${f.w}%`, height: `${f.h}%`,
              zIndex: isRug ? 1 : 2,
              cursor: f.interactable ? 'pointer' : 'default',
            }}
            onMouseEnter={() => f.interactable && setHoveredFurniture(f.id)}
            onMouseLeave={() => setHoveredFurniture(null)}
            onClick={() => f.interactable && onFurnitureClick?.(f.id)}
          >
            <div
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: style.bg,
                border: isHovered ? style.hoverBorder : style.border,
                borderRadius: isRug ? '50%' : 8,
                boxShadow: isHovered ? style.hoverShadow : style.shadow,
                transform: isHovered && f.interactable ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, border-color 0.2s ease',
              }}
            >
              {/* Window special: sky + frame + sun */}
              {isWindow && (
                <>
                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(60,130,200,0.4)' }} />
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'rgba(60,130,200,0.4)' }} />
                  <div style={{
                    position: 'absolute', top: '18%', right: '22%',
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#FFD060',
                    boxShadow: '0 0 8px rgba(255,210,80,0.9), 0 0 16px rgba(255,210,80,0.4)',
                  }} />
                </>
              )}

              {/* Icon */}
              {Icon && f.iconSize > 0 && (
                <Icon size={f.iconSize} />
              )}
            </div>

            {/* Hover tooltip */}
            {isHovered && f.interactable && (
              <div
                className="absolute left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-display whitespace-nowrap z-50"
                style={{
                  bottom: 'calc(100% + 4px)',
                  background: 'rgba(28,24,18,0.96)',
                  border: '1px solid rgba(255,240,180,0.15)',
                  color: '#FFF8E6',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  animation: 'rewardSlideUp 0.12s ease-out',
                }}
              >
                <span style={{ color: 'rgba(255,240,180,0.9)' }}>{f.name}</span>
                {f.description && (
                  <span style={{ color: 'rgba(255,248,230,0.45)', marginLeft: 4 }}>{f.description}</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Pet ── */}
      <div
        className="absolute"
        style={{
          left: `${petPos.x}%`,
          top: `${petPos.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          transition: 'left 0.7s cubic-bezier(0.25,0.46,0.45,0.94), top 0.7s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        {/* Floor shadow under pet */}
        <div
          style={{
            position: 'absolute',
            bottom: -4, left: '50%', transform: 'translateX(-50%)',
            width: 48, height: 8,
            background: 'rgba(0,0,0,0.18)',
            borderRadius: '50%',
            filter: 'blur(4px)',
          }}
        />

        <PetSprite
          species={pet.species}
          animation={anim}
          size={72}
          className="drop-shadow-lg"
        />

        {/* Name tag */}
        <div
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
          style={{
            bottom: -16,
            background: 'rgba(28,24,18,0.72)',
            border: '1px solid rgba(255,240,180,0.12)',
            borderRadius: 6,
            padding: '1px 6px',
            backdropFilter: 'blur(6px)',
          }}
        >
          <span style={{ fontSize: 9, color: 'rgba(255,248,230,0.75)', fontFamily: 'Quicksand, sans-serif' }}>
            {pet.name}
          </span>
          <span
            style={{
              display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
              background: getMoodColor(pet.mood),
              boxShadow: `0 0 4px ${getMoodColor(pet.mood)}`,
              marginLeft: 4, verticalAlign: 'middle',
            }}
          />
        </div>

        {/* Reaction bubble */}
        {petReaction && (
          <div
            className="absolute left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl whitespace-nowrap z-20"
            style={{
              bottom: 'calc(100% + 6px)',
              background: 'rgba(28,24,18,0.96)',
              border: '1px solid rgba(255,240,180,0.18)',
              color: '#FFF8E6',
              fontSize: 11,
              fontFamily: 'Quicksand, sans-serif',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              animation: 'rewardSlideUp 0.2s ease-out',
            }}
          >
            {petReaction}
            <div
              style={{
                position: 'absolute', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                bottom: -4, width: 6, height: 6,
                background: 'rgba(28,24,18,0.96)',
                borderRight: '1px solid rgba(255,240,180,0.18)',
                borderBottom: '1px solid rgba(255,240,180,0.18)',
              }}
            />
          </div>
        )}
      </div>

      {/* ── Running ambient particles ── */}
      {isRunning && Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 3, height: 3,
            left: `${22 + i * 18}%`,
            bottom: '28%',
            background: 'rgba(255,220,140,0.4)',
            animation: `float ${2.5 + i * 0.7}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}

      {/* ── Activity label ── */}
      <div
        className="absolute bottom-2 left-3 flex items-center gap-1.5 pointer-events-none"
        style={{ zIndex: 5 }}
      >
        <span
          style={{
            width: 5, height: 5, borderRadius: '50%',
            background: activityCfg.dot,
            boxShadow: `0 0 5px ${activityCfg.dot}`,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span style={{
          fontSize: 8, color: 'rgba(255,248,230,0.45)',
          fontFamily: 'Quicksand, sans-serif',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}>
          {activityCfg.label}
        </span>
      </div>
    </div>
  );
}
