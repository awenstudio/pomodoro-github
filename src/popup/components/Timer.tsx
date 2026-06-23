/* ─────────────────────────────────────────────────────
 *  Timer — Main timer display with circular progress,
 *  mode tabs, task display, and controls.
 * ───────────────────────────────────────────────────── */

import { useTimer } from '../hooks/useTimer';
import { Controls } from './Controls';
import type { SessionType } from '@/types';

const CIRCUMFERENCE = 2 * Math.PI * 88; // r=88 for the SVG circle

const MODE_CONFIG: Record<SessionType, { label: string; color: string; ringColor: string }> = {
  work: { label: 'Focus', color: 'text-tomato-400', ringColor: '#ef4444' },
  shortBreak: { label: 'Short Break', color: 'text-green-400', ringColor: '#22c55e' },
  longBreak: { label: 'Long Break', color: 'text-blue-400', ringColor: '#3b82f6' },
};

export function Timer() {
  const {
    displayTime,
    progress,
    currentSessionType,
    pomodorosInCycle,
    settings,
    todayStats,
    streak,
    currentTask,
    isRunning,
    isPaused,
  } = useTimer();

  const mode = MODE_CONFIG[currentSessionType];
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const completedToday = todayStats?.completedPomodoros || 0;

  return (
    <div className="flex flex-col items-center gap-5 animate-fade-in">
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
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="5"
          />
          {/* Progress ring */}
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
              filter: isRunning ? `drop-shadow(0 0 8px ${mode.ringColor}40)` : 'none',
            }}
          />
        </svg>

        {/* Center content */}
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

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < pomodorosInCycle
                ? 'bg-tomato-500 shadow-sm shadow-tomato-500/40'
                : 'bg-surface-3'
            }`}
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
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>🍅 {completedToday}/{settings.dailyGoal}</span>
        {streak.current > 0 && <span>🔥 {streak.current} day streak</span>}
      </div>
    </div>
  );
}
