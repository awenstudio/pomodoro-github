/* ─────────────────────────────────────────────────────
 *  Timer — Pawodoro main timer with pet companion.
 *  Warm, cozy palette. Pet-centric design.
 * ───────────────────────────────────────────────────── */

import { useTimer } from '../hooks/useTimer';
import { Controls } from './Controls';
import { getLevelFromXP, getMaxForgivenessCards } from '@/lib/gamification';
import { SPECIES_CONFIG } from '@/lib/pet-system';
import type { SessionType } from '@/types';

const CIRCUMFERENCE = 2 * Math.PI * 88;

const MODE_CONFIG: Record<SessionType, { label: string; color: string; ringColor: string }> = {
  work: { label: 'Focus', color: 'text-tea-400', ringColor: '#5AAF5E' },
  shortBreak: { label: 'Rest', color: 'text-mist-400', ringColor: '#7BA8D1' },
  longBreak: { label: 'Relax', color: 'text-blush-400', ringColor: '#FF8A8A' },
};

export function Timer() {
  const {
    displayTime, timerProgress, currentSessionType, pomodorosInCycle,
    settings, todayStats, streak, currentTask, isRunning, isPaused,
    progress: playerProgress, pet, feedPet, playWithPet, petPet,
  } = useTimer();

  const mode = MODE_CONFIG[currentSessionType];
  const dashOffset = CIRCUMFERENCE * (1 - timerProgress);
  const completedToday = todayStats?.completedPomodoros || 0;
  const levelInfo = getLevelFromXP(playerProgress.totalXP);

  const todayStr = new Date().toISOString().split('T')[0];
  const cardsUsedToday = playerProgress.forgivenessCardsDate === todayStr ? playerProgress.forgivenessCardsUsed : 0;
  const maxCards = getMaxForgivenessCards(playerProgress.level);
  const cardsRemaining = maxCards - cardsUsedToday;

  return (
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      {/* Level & XP bar */}
      <div className="w-full flex items-center gap-2 px-1">
        <span className="text-lg">{levelInfo.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-cream-300">
              Lv.{levelInfo.level} {levelInfo.name}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              {levelInfo.currentXP}/{levelInfo.requiredXP} XP
            </span>
          </div>
          <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-tea-400 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-2">
        {(['work', 'shortBreak', 'longBreak'] as SessionType[]).map((type) => (
          <button
            key={type}
            className={`px-3 py-1 rounded-xl text-xs transition-all duration-200 ${
              currentSessionType === type ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {MODE_CONFIG[type].label}
          </button>
        ))}
      </div>

      {/* Pet + Timer circle */}
      <div className={`relative w-52 h-52 ${isRunning ? 'animate-float' : ''}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Glow ring when running */}
          {isRunning && (
            <circle
              cx="100" cy="100" r="88"
              fill="none" stroke={mode.ringColor}
              strokeWidth="14" opacity="0.08"
              className="animate-pulse"
            />
          )}
          {/* Background track */}
          <circle
            cx="100" cy="100" r="88"
            fill="none" stroke="rgba(255,248,230,0.06)"
            strokeWidth="5"
          />
          {/* Progress ring */}
          <circle
            cx="100" cy="100" r="88"
            fill="none" stroke={mode.ringColor}
            strokeWidth="5" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="timer-ring"
            style={{
              filter: isRunning ? `drop-shadow(0 0 12px ${mode.ringColor}50)` : 'none',
              transition: 'filter 0.5s ease',
            }}
          />
        </svg>

        {/* Center: Pet + Time */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          {pet && (
            <span className={`text-4xl ${isRunning ? 'animate-sleep-bob' : 'animate-bounce-gentle'}`}>
              {SPECIES_CONFIG[pet.species]?.stages[pet.stage] || '🥚'}
            </span>
          )}
          <span
            className={`text-4xl font-light tracking-wider font-mono ${
              isRunning ? 'text-cream-100' : isPaused ? 'text-tea-400' : 'text-gray-400'
            }`}
          >
            {displayTime}
          </span>
          <span className={`text-[10px] ${mode.color} font-medium`}>
            {mode.label}
          </span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              i < pomodorosInCycle
                ? 'bg-moss-500 shadow-sm shadow-moss-500/30 scale-110'
                : 'bg-surface-3 scale-100'
            }`}
            style={{ transitionDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      {/* Current task */}
      {currentTask && (
        <div className="glass rounded-2xl px-3 py-1.5 max-w-full">
          <p className="text-[11px] text-cream-300 truncate">
            📋 {currentTask.name}
          </p>
        </div>
      )}

      {/* Controls */}
      <Controls />

      {/* Pet interactions (when idle) */}
      {pet && !isRunning && (
        <div className="glass rounded-2xl p-2.5 w-full max-w-[300px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span>{pet.mood >= 70 ? '😊' : pet.mood >= 40 ? '😐' : '😢'} {pet.mood}</span>
              <span>🍖 {pet.hunger}</span>
              <span>💕 {Math.floor(pet.affinity / 100)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={feedPet} disabled={pet.food <= 0}
                className="btn-ghost text-[10px] px-2 py-1 disabled:opacity-30"
                title="Feed">
                🍖 {pet.food}
              </button>
              <button onClick={playWithPet}
                className="btn-ghost text-[10px] px-2 py-1" title="Play">
                ⚽
              </button>
              <button onClick={petPet}
                className="btn-ghost text-[10px] px-2 py-1" title="Pet">
                🤲
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today summary */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>🍅 {completedToday}/{settings.dailyGoal}</span>
        {streak.current > 0 && <span>🔥 {streak.current}d</span>}
        <span className={cardsRemaining > 0 ? 'text-mist-400' : ''}>💫 {cardsRemaining}</span>
        <span className="text-tea-400">⚡ {playerProgress.totalXP}</span>
      </div>
    </div>
  );
}
