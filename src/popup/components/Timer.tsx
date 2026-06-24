/* ─────────────────────────────────────────────────────
 *  Timer — Pawodoro v3 with QQ Pet-style room system.
 *
 *  Layout: Level Bar → Tab Pill → Room Scene →
 *  Timer Bar → Quick Actions → Stats → Controls
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTimer } from '../hooks/useTimer';
import { Controls } from './Controls';
import { getLevelFromXP, getMaxForgivenessCards } from '@/lib/gamification';
import { playPet, playFeed, playLevelUp, playComplete } from '@/lib/sounds';
import type { SessionType } from '@/types';
import { Confetti } from './Confetti';
import { CompletionRewardCard } from './CompletionRewardCard';
import { PetRoom } from './PetRoom';
import type { TimerActivity } from './PetRoom';
import type { Pet } from '@/lib/pet-system';
import type { AnimationType } from './PetSprite';

/* ── Constants ─────────────────────────────────────── */

const CIRCUMFERENCE = 2 * Math.PI * 20;
const RING_RADIUS = 20;

const MODE_CONFIG: Record<
  SessionType,
  { label: string; accent: string; glow: string; pill: string; icon: string }
> = {
  work: {
    label: 'Focus',
    accent: '#5AAF5E',
    glow: 'rgba(90,175,94,0.35)',
    pill: 'rgba(90,175,94,0.18)',
    icon: '🎯',
  },
  shortBreak: {
    label: 'Rest',
    accent: '#7BA8D1',
    glow: 'rgba(123,168,209,0.35)',
    pill: 'rgba(123,168,209,0.18)',
    icon: '☕',
  },
  longBreak: {
    label: 'Relax',
    accent: '#FF8A8A',
    glow: 'rgba(255,138,138,0.35)',
    pill: 'rgba(255,138,138,0.18)',
    icon: '🌸',
  },
};

const MODES: SessionType[] = ['work', 'shortBreak', 'longBreak'];

/* ── Tab Pill ──────────────────────────────────────── */

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

  useEffect(() => {
    if (!tabsRef.current) return;
    const idx = modes.indexOf(current);
    const tab = tabsRef.current.children[idx] as HTMLElement;
    if (tab) setPillStyle({ left: tab.offsetLeft, width: tab.offsetWidth });
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
      <div
        className="absolute top-1 h-[calc(100%-8px)] rounded-xl will-change-transform"
        style={{
          left: pillStyle.left,
          width: pillStyle.width,
          background: mode.pill,
          border: `1px solid ${mode.accent}30`,
          boxShadow: `0 0 12px ${mode.glow}`,
          transition: 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
              className="relative z-10 px-3 py-1 rounded-xl text-[11px] font-medium
                         transition-all duration-300 select-none"
              style={{
                color: active ? cfg.accent : 'rgba(255,248,230,0.35)',
                transform: active ? 'scale(1)' : 'scale(0.95)',
                textShadow: active ? `0 0 8px ${cfg.glow}` : 'none',
              }}
            >
              <span className="mr-0.5">{cfg.icon}</span>
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Quick Action Button (QQ Pet style) ────────────── */

function QuickAction({
  icon,
  label,
  count,
  onClick,
  disabled,
  color,
  cooldownMs,
}: {
  icon: string;
  label: string;
  count?: number;
  onClick: () => void;
  disabled?: boolean;
  color: string;
  cooldownMs?: number;
}) {
  const [pressed, setPressed] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldownMs || cooldownMs <= 0) return;
    setCooldown(cooldownMs);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 100) { clearInterval(interval); return 0; }
        return prev - 100;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [cooldownMs]);

  const onCooldown = cooldown > 0;

  const handleClick = () => {
    if (disabled || onCooldown) return;
    setPressed(true);
    onClick();
    setTimeout(() => setPressed(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || onCooldown}
      className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl relative overflow-hidden
                 transition-all duration-200 group"
      style={{
        background: pressed ? `${color}15` : 'rgba(255,248,230,0.03)',
        border: `1px solid ${pressed ? `${color}30` : 'rgba(255,248,230,0.04)'}`,
        opacity: disabled ? 0.3 : onCooldown ? 0.6 : 1,
        cursor: disabled || onCooldown ? 'not-allowed' : 'pointer',
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
      }}
    >
      <span className="text-sm select-none relative z-10 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[9px] text-cream-400/40 font-display relative z-10">
        {onCooldown ? `${Math.ceil(cooldown / 1000)}s` : label}
        {count !== undefined && !onCooldown && (
          <span className="ml-0.5 font-mono text-cream-300/50">{count}</span>
        )}
      </span>
    </button>
  );
}

/* ── Summary Pill ──────────────────────────────────── */

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
      className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
      style={{
        background: 'rgba(255,248,230,0.03)',
        boxShadow: glow ? '0 0 6px rgba(255,159,74,0.15)' : 'none',
      }}
    >
      <span className="text-[10px] select-none">{emoji}</span>
      <span className="text-[10px] font-display font-semibold tabular-nums text-cream-200/60">
        {value}{max !== undefined ? `/${max}` : suffix ? ` ${suffix}` : ''}
      </span>
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
  const completedToday = todayStats?.completedPomodoros || 0;
  const levelInfo = getLevelFromXP(playerProgress.totalXP);

  const todayStr = new Date().toISOString().split('T')[0];
  const cardsUsedToday =
    playerProgress.forgivenessCardsDate === todayStr
      ? playerProgress.forgivenessCardsUsed
      : 0;
  const maxCards = getMaxForgivenessCards(playerProgress.level);
  const cardsRemaining = maxCards - cardsUsedToday;

  // Entrance animation
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Completion celebration
  const [celebrating, setCelebrating] = useState(false);
  const prevProgress = useRef(timerProgress);
  useEffect(() => {
    if (prevProgress.current > 0.95 && timerProgress < 0.05) {
      setCelebrating(true);
      playComplete();
      setTimeout(() => setCelebrating(false), 3000);
    }
    prevProgress.current = timerProgress;
  }, [timerProgress]);

  // Pet interaction state
  const [petAnimOverride, setPetAnimOverride] = useState<AnimationType | null>(null);
  const [petReaction, setPetReaction] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState({ feed: 0, play: 0, pet: 0 });
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handlePetInteraction = useCallback(async (type: 'feed' | 'play' | 'pet') => {
    const action = type === 'feed' ? feedPet : type === 'play' ? playWithPet : petPet;
    if (type === 'feed') playFeed(); else playPet();

    const animState: AnimationType = type === 'feed' ? 'eating' : type === 'play' ? 'playing' : 'petting';
    setPetAnimOverride(animState);

    const result = await action();

    if (result?.success && result.data) {
      const data = result.data as { pet: Pet; reaction: string; statChanges: { mood: number; hunger: number; affinity: number }; cooldownMs: number };
      setPetReaction(data.reaction);
      setCooldowns((prev) => ({ ...prev, [type]: data.cooldownMs }));

      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => {
        setPetReaction(null);
        setPetAnimOverride(null);
      }, 2500);
    } else {
      if (result?.data) {
        const data = result.data as { reaction?: string };
        if (data.reaction) setPetReaction(data.reaction);
      }
      setTimeout(() => {
        setPetReaction(null);
        setPetAnimOverride(null);
      }, 1500);
    }
  }, [feedPet, playWithPet, petPet]);

  // Map timer state to room activity
  const roomActivity: TimerActivity = isRunning
    ? (currentSessionType === 'work' ? 'focus' : currentSessionType === 'shortBreak' ? 'rest' : 'relax')
    : isPaused
      ? 'idle'
      : 'idle';

  // Swipe gesture
  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 50) return;
    const idx = MODES.indexOf(currentSessionType);
    if (dx < 0 && idx < MODES.length - 1) switchSession(MODES[idx + 1]);
    else if (dx > 0 && idx > 0) switchSession(MODES[idx - 1]);
  }, [currentSessionType, switchSession]);

  // Staggered entrance
  const stagger = (i: number): React.CSSProperties => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity 0.4s ease ${i * 50}ms, transform 0.4s ease ${i * 50}ms`,
  });

  // Mini progress ring
  const dashOffset = CIRCUMFERENCE * (1 - timerProgress);

  return (
    <div
      className="flex flex-col items-center gap-3 px-3 pt-1.5 pb-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Level + Tabs (compact) ── */}
      <div className="w-full flex items-center gap-2" style={stagger(0)}>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-sm select-none">{levelInfo.icon}</span>
          <span className="text-[10px] text-cream-300/60 font-display truncate">
            Lv.{levelInfo.level}
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,248,230,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${levelInfo.progress * 100}%`,
                background: `linear-gradient(90deg, ${mode.accent}88, ${mode.accent})`,
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>
        <TabPill modes={MODES} current={currentSessionType} onSelect={switchSession} modeConfig={MODE_CONFIG} />
      </div>

      {/* ── Room Scene (main area) ── */}
      <div className="w-full relative" style={stagger(1)}>
        {pet && (
          <PetRoom
            pet={pet}
            activity={roomActivity}
            isRunning={isRunning}
            petAnimOverride={petAnimOverride}
            petReaction={petReaction}
            onFurnitureClick={(id) => {
              if (id === 'food') handlePetInteraction('feed');
              else if (id === 'toy') handlePetInteraction('play');
              else if (id === 'desk' && !isRunning) switchSession('work');
              else if (id === 'bed' && !isRunning) switchSession('shortBreak');
              else if (id === 'bookshelf' && !isRunning) switchSession('longBreak');
            }}
          />
        )}

        {/* Celebration overlay */}
        <Confetti active={celebrating} particleCount={20} />
        {celebrating && pet && (
          <CompletionRewardCard
            xpEarned={25 + (pet.level ?? 0) * 5}
            petMoodChange={5}
            petName={pet.name}
            streakCount={1}
            duration={25}
            onComplete={() => setCelebrating(false)}
          />
        )}
      </div>

      {/* ── Timer Bar (compact, QQ Pet style) ── */}
      <div
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(255,248,230,0.03)',
          border: '1px solid rgba(255,248,230,0.05)',
          ...stagger(2),
        }}
      >
        {/* Mini progress ring */}
        <div className="relative" style={{ width: 40, height: 40 }}>
          <svg viewBox="0 0 44 44" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="22" cy="22" r={RING_RADIUS} fill="none" stroke="rgba(255,248,230,0.06)" strokeWidth="3" strokeLinecap="round" />
            <circle
              cx="22" cy="22" r={RING_RADIUS}
              fill="none" stroke={mode.accent} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] select-none">
            {mode.icon}
          </span>
        </div>

        {/* Time + Label */}
        <div className="flex-1">
          <span
            className="text-2xl font-semibold tracking-wider font-display tabular-nums"
            style={{
              color: isRunning ? '#FFF8E6' : isPaused ? mode.accent : 'rgba(255,248,230,0.3)',
              textShadow: isRunning ? `0 0 12px ${mode.glow}` : 'none',
              transition: 'color 0.3s ease',
            }}
          >
            {displayTime}
          </span>
          <span
            className="text-[9px] font-medium tracking-widest uppercase ml-2"
            style={{ color: `${mode.accent}88` }}
          >
            {mode.label}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: i < pomodorosInCycle ? 6 : 4,
                height: i < pomodorosInCycle ? 6 : 4,
                background: i < pomodorosInCycle
                  ? mode.accent
                  : 'rgba(255,248,230,0.08)',
                boxShadow: i < pomodorosInCycle ? `0 0 4px ${mode.glow}` : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Controls ── */}
      <div style={stagger(3)}>
        <Controls />
      </div>

      {/* ── Quick Actions (QQ Pet style bottom bar) ── */}
      {pet && (
        <div
          className="w-full flex items-center gap-1.5"
          style={stagger(4)}
        >
          <QuickAction
            icon="🍖"
            label="Feed"
            count={pet.food}
            onClick={() => handlePetInteraction('feed')}
            disabled={pet.food <= 0}
            color="#FF9E4A"
            cooldownMs={cooldowns.feed}
          />
          <QuickAction
            icon="⚽"
            label="Play"
            onClick={() => handlePetInteraction('play')}
            color="#7BA8D1"
            cooldownMs={cooldowns.play}
          />
          <QuickAction
            icon="🤲"
            label="Pet"
            onClick={() => handlePetInteraction('pet')}
            color="#FF8A8A"
            cooldownMs={cooldowns.pet}
          />
          <QuickAction
            icon="📖"
            label="Study"
            onClick={() => { if (!isRunning) switchSession('work'); }}
            disabled={isRunning}
            color="#C4A4F7"
          />
          <QuickAction
            icon="💤"
            label="Sleep"
            onClick={() => { if (!isRunning) switchSession('shortBreak'); }}
            disabled={isRunning}
            color="#7BA8D1"
          />
        </div>
      )}

      {/* ── Stats Bar (compact) ── */}
      <div
        className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl"
        style={{
          background: 'rgba(255,248,230,0.02)',
          border: '1px solid rgba(255,248,230,0.03)',
          ...stagger(5),
        }}
      >
        <div className="flex items-center gap-1">
          <SummaryPill emoji="🍅" value={completedToday} max={settings.dailyGoal} />
          {streak.current > 0 && <SummaryPill emoji="🔥" value={streak.current} suffix="d" glow />}
        </div>
        <div className="flex items-center gap-1">
          <SummaryPill emoji="💫" value={cardsRemaining} />
          <SummaryPill emoji="⚡" value={playerProgress.totalXP} />
          {pet && (
            <SummaryPill emoji="❤️" value={Math.floor(pet.affinity / 100)} suffix="%" />
          )}
        </div>
      </div>

      {/* ── Current Task ── */}
      {currentTask && (
        <div
          className="w-full glass rounded-xl px-3 py-1.5"
          style={stagger(6)}
        >
          <p className="text-[10px] text-cream-300/60 truncate">
            📋 {currentTask.name}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Inline keyframes ──────────────────────────────── */

const STYLE_ID = 'pawodoro-timer-animations';

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes glowPulseRing {
      0%, 100% { opacity: 0.6; transform: scale(1.15); }
      50% { opacity: 1; transform: scale(1.22); }
    }
    @keyframes petBreathe {
      0%, 100% { transform: scale(1) translateY(0); }
      50% { transform: scale(1.03) translateY(-2px); }
    }
    @keyframes rewardBounce {
      0% { transform: scale(0) rotate(-10deg); opacity: 0; }
      60% { transform: scale(1.15) rotate(3deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes rewardSlideUp {
      0% { transform: translateY(12px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

injectKeyframes();
