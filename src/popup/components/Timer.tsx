/* ─────────────────────────────────────────────────────
 *  Timer — Pawodoro premium timer with pet companion.
 *  Glass morphism, gradient rings, micro-interactions.
 *  v2: Full animation overhaul, spring physics,
 *  gesture support, keyboard shortcuts.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTimer } from '../hooks/useTimer';
import { Controls } from './Controls';
import { getLevelFromXP, getMaxForgivenessCards } from '@/lib/gamification';
import { PetSprite } from './PetSprite';
import type { SessionType } from '@/types';

/* ── Constants ─────────────────────────────────────── */

const CIRCUMFERENCE = 2 * Math.PI * 88;
const RING_CENTER = 100;
const RING_RADIUS = 88;

const MODE_CONFIG: Record<
  SessionType,
  { label: string; accent: string; ring: string; glow: string; pill: string; icon: string }
> = {
  work: {
    label: 'Focus',
    accent: '#5AAF5E',
    ring: '#5AAF5E',
    glow: 'rgba(90,175,94,0.35)',
    pill: 'rgba(90,175,94,0.18)',
    icon: '🎯',
  },
  shortBreak: {
    label: 'Rest',
    accent: '#7BA8D1',
    ring: '#7BA8D1',
    glow: 'rgba(123,168,209,0.35)',
    pill: 'rgba(123,168,209,0.18)',
    icon: '☕',
  },
  longBreak: {
    label: 'Relax',
    accent: '#FF8A8A',
    ring: '#FF8A8A',
    glow: 'rgba(255,138,138,0.35)',
    pill: 'rgba(255,138,138,0.18)',
    icon: '🌸',
  },
};

const MODES: SessionType[] = ['work', 'shortBreak', 'longBreak'];

/* ── Spring physics helper ─────────────────────────── */

function springValue(current: number, target: number, velocity: number, dt: number): [number, number] {
  const stiffness = 180;
  const damping = 12;
  const force = -stiffness * (current - target);
  const dampForce = -damping * velocity;
  const accel = force + dampForce;
  const newVel = velocity + accel * dt;
  const newVal = current + newVel * dt;
  return [newVal, newVel];
}

/* ── Particle system ───────────────────────────────── */

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  opacity: number;
  speed: number;
  delay: number;
  endX: number;
  endY: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angleDeg = (360 / count) * i + Math.random() * 30;
    const angleRad = (angleDeg * Math.PI) / 180;
    const distance = 96 + Math.random() * 16;
    return {
      id: i,
      angle: angleDeg,
      distance,
      size: 2 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.5,
      speed: 2 + Math.random() * 4,
      delay: Math.random() * 3,
      endX: Math.cos(angleRad) * distance,
      endY: Math.sin(angleRad) * distance,
    };
  });
}

/* ── Animated number component ─────────────────────── */

function AnimatedNumber({
  value,
  className,
  suffix = '',
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const velRef = useRef(0);
  const valRef = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    let raf: number;
    const start = performance.now();
    const duration = 400;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(prev.current + (value - prev.current) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    prev.current = value;
    valRef.current = value;
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}

/* ── Tab Pill with spring animation ────────────────── */

function TabPill({
  modes,
  current,
  onSelect,
  modeConfig,
}: {
  modes: SessionType[];
  current: SessionType;
  onSelect: (type: SessionType) => void;
  modeConfig: typeof MODE_CONFIG;
}) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const prevIdx = useRef(0);

  useEffect(() => {
    const idx = modes.indexOf(current);
    if (idx !== prevIdx.current) {
      setSlideDir(idx > prevIdx.current ? 'right' : 'left');
      prevIdx.current = idx;
    }
    if (!tabsRef.current) return;
    const tabs = tabsRef.current.children;
    const tab = tabs[idx] as HTMLElement;
    if (tab) {
      setPillStyle({ left: tab.offsetLeft, width: tab.offsetWidth });
    }
  }, [current, modes]);

  const mode = MODE_CONFIG[current];

  return (
    <div
      className="relative flex items-center p-1 rounded-2xl"
      style={{
        background: 'rgba(255,248,230,0.04)',
        border: '1px solid rgba(255,248,230,0.06)',
      }}
    >
      {/* Sliding pill background */}
      <div
        className="absolute top-1 h-[calc(100%-8px)] rounded-xl will-change-transform"
        style={{
          left: pillStyle.left,
          width: pillStyle.width,
          background: mode.pill,
          border: `1px solid ${mode.accent}30`,
          boxShadow: `0 0 12px ${mode.glow}`,
          transition: 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, box-shadow 0.3s ease',
        }}
      />

      <div ref={tabsRef} className="relative flex items-center gap-0.5">
        {modes.map((type) => {
          const cfg = modeConfig[type];
          const active = current === type;
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="relative z-10 px-4 py-1.5 rounded-xl text-xs font-medium
                         transition-all duration-300 select-none"
              style={{
                color: active ? cfg.accent : 'rgba(255,248,230,0.35)',
                transform: active ? 'scale(1)' : 'scale(0.95)',
                textShadow: active ? `0 0 8px ${cfg.glow}` : 'none',
              }}
            >
              <span className="mr-1">{cfg.icon}</span>
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Timer Component ──────────────────────────── */

export function Timer() {
  const {
    displayTime,
    timerProgress,
    currentSessionType,
    pomodorosInCycle,
    settings,
    todayStats,
    streak,
    currentTask,
    isRunning,
    isPaused,
    progress: playerProgress,
    pet,
    feedPet,
    playWithPet,
    petPet,
    switchSession,
  } = useTimer();

  const mode = MODE_CONFIG[currentSessionType];
  const dashOffset = CIRCUMFERENCE * (1 - timerProgress);
  const completedToday = todayStats?.completedPomodoros || 0;
  const levelInfo = getLevelFromXP(playerProgress.totalXP);

  const todayStr = new Date().toISOString().split('T')[0];
  const cardsUsedToday =
    playerProgress.forgivenessCardsDate === todayStr
      ? playerProgress.forgivenessCardsUsed
      : 0;
  const maxCards = getMaxForgivenessCards(playerProgress.level);
  const cardsRemaining = maxCards - cardsUsedToday;

  // Particles (memoized)
  const particles = useMemo(() => generateParticles(12), []);

  // Entrance animation state
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Completion celebration state
  const [celebrating, setCelebrating] = useState(false);
  const prevProgress = useRef(timerProgress);
  useEffect(() => {
    if (prevProgress.current > 0.95 && timerProgress < 0.05) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 3000);
    }
    prevProgress.current = timerProgress;
  }, [timerProgress]);

  // Pet animation based on mode + state
  const getAnimation = useCallback(() => {
    if (!isRunning && !isPaused) return 'idle';
    switch (currentSessionType) {
      case 'work': return 'focus';
      case 'shortBreak': return 'rest';
      case 'longBreak': return 'relax';
      default: return 'idle';
    }
  }, [isRunning, isPaused, currentSessionType]);

  // Swipe gesture for tab switching
  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 50) return;
    const idx = MODES.indexOf(currentSessionType);
    if (dx < 0 && idx < MODES.length - 1) {
      switchSession(MODES[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      switchSession(MODES[idx - 1]);
    }
  }, [currentSessionType, switchSession]);

  // Staggered entrance delay helper
  const stagger = (i: number): React.CSSProperties => ({
    animationDelay: `${i * 60}ms`,
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms`,
  });

  return (
    <div
      className="flex flex-col items-center gap-4 px-4 pt-2 pb-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Level & XP Bar ── */}
      <div
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl"
        style={{
          background: 'rgba(255,248,230,0.03)',
          border: '1px solid rgba(255,248,230,0.05)',
          ...stagger(0),
        }}
      >
        <span className="text-xl select-none">{levelInfo.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-cream-200 font-medium tracking-wide">
              Lv.{levelInfo.level} {levelInfo.name}
            </span>
            <span className="text-[10px] text-cream-400/50 font-mono">
              {levelInfo.currentXP}/{levelInfo.requiredXP} XP
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,248,230,0.06)' }}
          >
            <div
              className="h-full rounded-full will-change-[width]"
              style={{
                width: `${levelInfo.progress * 100}%`,
                background: `linear-gradient(90deg, ${mode.accent}88, ${mode.accent})`,
                boxShadow: `0 0 8px ${mode.glow}`,
                transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1), background 0.5s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Mode Tabs ── */}
      <div style={stagger(1)}>
        <TabPill
          modes={MODES}
          current={currentSessionType}
          onSelect={switchSession}
          modeConfig={MODE_CONFIG}
        />
      </div>

      {/* ── Timer Ring + Pet ── */}
      <div
        className="relative"
        style={{ width: 240, height: 240, ...stagger(2) }}
      >
        {/* Outer glow when running */}
        {isRunning && (
          <div
            className="absolute inset-0 rounded-full will-change-transform"
            style={{
              background: `radial-gradient(circle, ${mode.glow} 0%, transparent 70%)`,
              animation: 'glowPulseRing 2.5s ease-in-out infinite',
              transform: 'scale(1.15)',
            }}
          />
        )}

        {/* Celebration sparkles */}
        {celebrating && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (360 / 16) * i;
              const rad = (angle * Math.PI) / 180;
              const dist = 60 + Math.random() * 40;
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    background: ['#FFD700', '#FF6B6B', '#5AAF5E', '#7BA8D1', '#FF8A8A'][i % 5],
                    animation: `sparkle${i % 4} 0.8s ease-out ${i * 50}ms forwards`,
                    transform: `translate(-50%, -50%)`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Particles when running */}
        {isRunning &&
          particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full will-change-transform"
              style={{
                width: p.size,
                height: p.size,
                background: mode.accent,
                left: '50%',
                top: '50%',
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                opacity: 0,
                animation: `particleDrift${p.id} ${p.speed}s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}

        <svg
          className="w-full h-full"
          viewBox="0 0 200 200"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <defs>
            <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={mode.accent} stopOpacity="1" />
              <stop offset="50%" stopColor={mode.accent} stopOpacity="0.8" />
              <stop offset="100%" stopColor={mode.accent} stopOpacity="0.5" />
            </linearGradient>
            <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,248,230,0.04)"
            strokeWidth="6"
          />

          {/* Tick marks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i * 6 * Math.PI) / 180;
            const isMajor = i % 5 === 0;
            const innerR = isMajor ? 78 : 80;
            const outerR = 84;
            return (
              <line
                key={i}
                x1={RING_CENTER + innerR * Math.cos(angle)}
                y1={RING_CENTER + innerR * Math.sin(angle)}
                x2={RING_CENTER + outerR * Math.cos(angle)}
                y2={RING_CENTER + outerR * Math.sin(angle)}
                stroke={`rgba(255,248,230,${isMajor ? 0.1 : 0.04})`}
                strokeWidth={isMajor ? 1.5 : 0.5}
              />
            );
          })}

          {/* Progress ring */}
          <circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            fill="none"
            stroke="url(#ring-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            filter={isRunning ? 'url(#ring-glow)' : undefined}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />

          {/* Progress cap glow dot */}
          {timerProgress > 0.01 && (
            <circle
              cx={
                RING_CENTER +
                RING_RADIUS * Math.cos((timerProgress * 360 - 90) * (Math.PI / 180))
              }
              cy={
                RING_CENTER +
                RING_RADIUS * Math.sin((timerProgress * 360 - 90) * (Math.PI / 180))
              }
              r="4"
              fill={mode.accent}
              opacity={isRunning ? 0.9 : 0.5}
              style={{
                filter: `drop-shadow(0 0 6px ${mode.accent})`,
                transition: 'cx 0.8s cubic-bezier(0.22,1,0.36,1), cy 0.8s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          )}
        </svg>

        {/* Center content: Pet + Time */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 10 }}>
          {/* Pet sprite */}
          {pet && (
            <div
              style={{
                animation: isRunning ? undefined : 'petBreathe 3s ease-in-out infinite',
              }}
            >
              <PetSprite
                species={pet.species}
                animation={getAnimation()}
                size={80}
                className="drop-shadow-lg"
              />
            </div>
          )}

          {/* Time display */}
          <div className="flex flex-col items-center -mt-1">
            <span
              className="text-4xl font-light tracking-widest font-mono tabular-nums"
              style={{
                color: isRunning ? '#FFF8E6' : isPaused ? mode.accent : 'rgba(255,248,230,0.3)',
                textShadow: isRunning ? `0 0 20px ${mode.glow}` : 'none',
                transition: 'color 0.4s ease, text-shadow 0.4s ease',
              }}
            >
              {displayTime}
            </span>
            <span
              className="text-[10px] font-medium tracking-widest uppercase"
              style={{ color: `${mode.accent}99` }}
            >
              {mode.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Progress Dots ── */}
      <div className="flex items-center gap-2" style={stagger(3)}>
        {Array.from({ length: settings.longBreakInterval }).map((_, i) => {
          const completed = i < pomodorosInCycle;
          return (
            <div
              key={i}
              className="flex items-center gap-1"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div
                className="rounded-full will-change-transform"
                style={{
                  width: completed ? 10 : 8,
                  height: completed ? 10 : 8,
                  background: completed
                    ? `linear-gradient(135deg, ${mode.accent}, ${mode.accent}CC)`
                    : 'rgba(255,248,230,0.08)',
                  boxShadow: completed ? `0 0 8px ${mode.glow}, 0 0 2px ${mode.accent}` : 'none',
                  transform: completed ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Current Task ── */}
      {currentTask && (
        <div
          className="w-full glass rounded-2xl px-3 py-2"
          style={stagger(4)}
        >
          <p className="text-[11px] text-cream-300/70 truncate">
            📋 {currentTask.name}
          </p>
        </div>
      )}

      {/* ── Controls ── */}
      <div style={stagger(5)}>
        <Controls />
      </div>

      {/* ── Pet Interaction Card (idle only) ── */}
      {pet && !isRunning && !isPaused && (
        <div
          className="w-full rounded-2xl p-3"
          style={{
            background: 'rgba(255,248,230,0.03)',
            border: '1px solid rgba(255,248,230,0.06)',
            backdropFilter: 'blur(12px)',
            ...stagger(6),
          }}
        >
          {/* Pet mood & stats header */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm select-none">
                {pet.mood >= 70 ? '😊' : pet.mood >= 40 ? '😐' : '😢'}
              </span>
              <span className="text-[11px] text-cream-200/60 font-medium">
                {pet.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-cream-400/40">
                ❤️ {Math.floor(pet.affinity / 100)}%
              </span>
            </div>
          </div>

          {/* Mood bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] text-cream-400/30 uppercase tracking-wider">Mood</span>
              <span className="text-[9px] text-cream-400/40 font-mono">{pet.mood}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,248,230,0.05)' }}>
              <div
                className="h-full rounded-full will-change-[width]"
                style={{
                  width: `${pet.mood}%`,
                  background: pet.mood >= 70
                    ? 'linear-gradient(90deg, #5AAF5E, #7BC47A)'
                    : pet.mood >= 40
                      ? 'linear-gradient(90deg, #FFD97A, #FF9E4A)'
                      : 'linear-gradient(90deg, #FF6B6B, #FF8A8A)',
                  transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>
          </div>

          {/* Hunger bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] text-cream-400/30 uppercase tracking-wider">Hunger</span>
              <span className="text-[9px] text-cream-400/40 font-mono">{pet.hunger}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,248,230,0.05)' }}>
              <div
                className="h-full rounded-full will-change-[width]"
                style={{
                  width: `${pet.hunger}%`,
                  background: 'linear-gradient(90deg, #FF9E4A, #FFD97A)',
                  transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <PetActionButton
              icon="🍖"
              label="Feed"
              count={pet.food}
              onClick={feedPet}
              disabled={pet.food <= 0}
              color="#FF9E4A"
            />
            <PetActionButton
              icon="⚽"
              label="Play"
              onClick={playWithPet}
              color="#7BA8D1"
            />
            <PetActionButton
              icon="🤲"
              label="Pet"
              onClick={petPet}
              color="#FF8A8A"
            />
          </div>
        </div>
      )}

      {/* ── Today Summary ── */}
      <div
        className="w-full flex items-center justify-center gap-3 py-2 px-3 rounded-2xl"
        style={{
          background: 'rgba(255,248,230,0.02)',
          border: '1px solid rgba(255,248,230,0.04)',
          ...stagger(7),
        }}
      >
        <SummaryPill emoji="🍅" value={completedToday} max={settings.dailyGoal} />
        {streak.current > 0 && (
          <SummaryPill emoji="🔥" value={streak.current} suffix="d" glow />
        )}
        <SummaryPill emoji="💫" value={cardsRemaining} />
        <SummaryPill emoji="⚡" value={playerProgress.totalXP} />
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────── */

function PetActionButton({
  icon,
  label,
  count,
  onClick,
  disabled,
  color,
}: {
  icon: string;
  label: string;
  count?: number;
  onClick: () => void;
  disabled?: boolean;
  color: string;
}) {
  const [pressed, setPressed] = useState(false);
  const [ripplePos, setRipplePos] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setPressed(true);
    onClick();
    setTimeout(() => {
      setPressed(false);
      setRipplePos(null);
    }, 400);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl relative overflow-hidden
                 transition-all duration-200"
      style={{
        background: pressed ? `${color}15` : 'rgba(255,248,230,0.03)',
        border: `1px solid ${pressed ? `${color}30` : 'rgba(255,248,230,0.05)'}`,
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
      }}
    >
      {/* Ripple effect */}
      {ripplePos && (
        <span
          className="absolute rounded-full pointer-events-none animate-ping"
          style={{
            left: ripplePos.x - 20,
            top: ripplePos.y - 20,
            width: 40,
            height: 40,
            background: `${color}20`,
          }}
        />
      )}
      <span className="text-base select-none relative z-10">{icon}</span>
      <span className="text-[9px] text-cream-400/40 font-medium relative z-10">
        {label}
        {count !== undefined && (
          <span className="ml-0.5 font-mono">{count}</span>
        )}
      </span>
    </button>
  );
}

function SummaryPill({
  emoji,
  value,
  max,
  suffix,
  glow,
}: {
  emoji: string;
  value: number;
  max?: number;
  suffix?: string;
  glow?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-xl transition-all duration-300"
      style={{
        background: 'rgba(255,248,230,0.03)',
        boxShadow: glow ? '0 0 8px rgba(255,159,74,0.2)' : 'none',
      }}
    >
      <span className="text-xs select-none">{emoji}</span>
      <AnimatedNumber
        value={value}
        className="text-[11px] font-mono font-medium tabular-nums text-cream-200/60"
        suffix={max !== undefined ? `/${max}` : suffix ? ` ${suffix}` : ''}
      />
    </div>
  );
}

/* ── Inline keyframes (injected once) ──────────────── */

const STYLE_ID = 'pawodoro-timer-animations';

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;

  // Generate unique particle keyframes with pre-calculated positions
  let particleKeyframes = '';
  for (let i = 0; i < 12; i++) {
    const angleDeg = (360 / 12) * i;
    const angleRad = (angleDeg * Math.PI) / 180;
    const dist = 100;
    const startX = Math.cos(angleRad) * dist * 0.2;
    const startY = Math.sin(angleRad) * dist * 0.2;
    const endX = Math.cos(angleRad) * dist;
    const endY = Math.sin(angleRad) * dist;
    particleKeyframes += `
      @keyframes particleDrift${i} {
        0% { transform: translate(${startX}px, ${startY}px); opacity: 0; }
        15% { opacity: 0.6; }
        85% { opacity: 0.6; }
        100% { transform: translate(${endX}px, ${endY}px); opacity: 0; }
      }
    `;
  }

  style.textContent = `
    @keyframes glowPulseRing {
      0%, 100% { opacity: 0.6; transform: scale(1.15); }
      50% { opacity: 1; transform: scale(1.22); }
    }

    @keyframes petBreathe {
      0%, 100% { transform: scale(1) translateY(0); }
      50% { transform: scale(1.03) translateY(-2px); }
    }

    @keyframes petBounceComplete {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-8px) rotate(-3deg); }
      50% { transform: translateY(-4px) rotate(0deg); }
      75% { transform: translateY(-8px) rotate(3deg); }
    }

    @keyframes sparkle0 {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
      100% { transform: translate(-50%, -50%) translate(40px, -60px) scale(1.5); opacity: 0; }
    }
    @keyframes sparkle1 {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
      100% { transform: translate(-50%, -50%) translate(-50px, -40px) scale(1.5); opacity: 0; }
    }
    @keyframes sparkle2 {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
      100% { transform: translate(-50%, -50%) translate(30px, 50px) scale(1.5); opacity: 0; }
    }
    @keyframes sparkle3 {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
      100% { transform: translate(-50%, -50%) translate(-40px, 40px) scale(1.5); opacity: 0; }
    }
    ${particleKeyframes}
  `;
  document.head.appendChild(style);
}

// Inject on module load
injectKeyframes();
