/* ─────────────────────────────────────────────────────
 *  Timer — Main timer display with circular progress,
 *  mode tabs, level/XP display, and controls.
 * ───────────────────────────────────────────────────── */

import { useTimer } from '../hooks/useTimer';
import { Controls } from './Controls';
import { getLevelFromXP, getMaxForgivenessCards } from '@/lib/gamification';
import type { SessionType } from '@/types';

const CIRCUMFERENCE = 2 * Math.PI * 88;

const MODE_CONFIG: Record<SessionType, { label: string; color: string; ringColor: string }> = {
  work: { label: 'Focus', color: 'text-tomato-400', ringColor: '#ef4444' },
  shortBreak: { label: 'Short Break', color: 'text-green-400', ringColor: '#22c55e' },
  longBreak: { label: 'Long Break', color: 'text-blue-400', ringColor: '#3b82f6' },
};

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
  } = useTimer();

  const mode = MODE_CONFIG[currentSessionType];
  const dashOffset = CIRCUMFERENCE * (1 - timerProgress);
  const completedToday = todayStats?.completedPomodoros || 0;
  const levelInfo = getLevelFromXP(playerProgress.totalXP);

  // Forgiveness cards
  const todayStr = new Date().toISOString().split('T')[0];
  const cardsUsedToday = playerProgress.forgivenessCardsDate === todayStr ? playerProgress.forgivenessCardsUsed : 0;
  const maxCards = getMaxForgivenessCards(playerProgress.level);
  const cardsRemaining = maxCards - cardsUsedToday;

  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      {/* Level & XP bar */}
      <div className="w-full flex items-center gap-2 px-1">
        <span className="text-lg" title={`Level ${levelInfo.level}: ${levelInfo.name}`}>
          {levelInfo.icon}
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-gray-400">
              Lv.{levelInfo.level} {levelInfo.name}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              {levelInfo.currentXP}/{levelInfo.requiredXP} XP
            </span>
          </div>
          <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-2">
        {(['work', 'shortBreak', 'longBreak'] as SessionType[]).map((type) => (
          <button
            key={type}
            className={`px-3 py-1 rounded-lg text-xs transition-all duration-150 ${
              currentSessionType === type ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {MODE_CONFIG[type].label}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className={`relative w-52 h-52 ${isRunning ? 'animate-float' : ''}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Glow background circle (only when running) */}
          {isRunning && (
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke={mode.ringColor}
              strokeWidth="12"
              opacity="0.08"
              className="animate-pulse"
            />
          )}
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="5"
          />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke={mode.ringColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="timer-ring"
            style={{
              filter: isRunning
                ? `drop-shadow(0 0 12px ${mode.ringColor}60)`
                : 'none',
              transition: 'filter 0.5s ease',
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-5xl font-light tracking-wider font-mono ${
              isRunning ? 'text-white' : isPaused ? 'text-amber-400' : 'text-gray-300'
            }`}
          >
            {displayTime}
          </span>
          <span className={`text-xs mt-1 ${mode.color} font-medium`}>
            {mode.label}
          </span>
        </div>
      </div>

      {/* Progress dots with stagger animation */}
      <div className="flex items-center gap-2">
        {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              i < pomodorosInCycle
                ? 'bg-tomato-500 shadow-sm shadow-tomato-500/40 scale-110'
                : 'bg-surface-3 scale-100'
            }`}
            style={{ transitionDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      {/* Current task */}
      {currentTask && (
        <div className="glass rounded-xl px-3 py-2 max-w-full">
          <p className="text-xs text-gray-400 truncate">
            📋 {currentTask.name}
            {currentTask.repo && (
              <span className="text-gray-600 ml-1">· {currentTask.repo}</span>
            )}
          </p>
        </div>
      )}

      {/* Controls */}
      <Controls />

      {/* Today summary */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span title="Pomodoros today">🍅 {completedToday}/{settings.dailyGoal}</span>
        {streak.current > 0 && <span title="Day streak">🔥 {streak.current}d</span>}
        <span title="Forgiveness cards remaining" className={cardsRemaining > 0 ? 'text-blue-400' : ''}>
          💫 {cardsRemaining}
        </span>
        <span title="Total XP" className="text-amber-500">⚡ {playerProgress.totalXP}</span>
      </div>
    </div>
  );
}
