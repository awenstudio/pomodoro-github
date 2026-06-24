/* ─────────────────────────────────────────────────────
 *  Achievements — Milestone tracking and display.
 *  v2: Unlock animation, staggered grid, hover tooltips.
 * ───────────────────────────────────────────────────── */

import { useMemo, useState, useEffect } from 'react';
import type { DailyStats, StreakData } from '@/types';
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/constants';

interface AchievementsProps {
  dailyStats: Record<string, DailyStats>;
  streak: StreakData;
}

export function Achievements({ dailyStats, streak }: AchievementsProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const achievements = useMemo(() => {
    const totalPomodoros = Object.values(dailyStats).reduce(
      (sum, d) => sum + d.completedPomodoros, 0,
    );
    const totalFocusMinutes = Object.values(dailyStats).reduce(
      (sum, d) => sum + d.focusMinutes, 0,
    );
    const bestDay = Math.max(
      0, ...Object.values(dailyStats).map((d) => d.completedPomodoros),
    );

    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      let unlocked = false;
      switch (def.id) {
        case 'first_pomodoro': unlocked = totalPomodoros >= 1; break;
        case 'streak_3': unlocked = streak.longest >= 3; break;
        case 'streak_7': unlocked = streak.longest >= 7; break;
        case 'streak_30': unlocked = streak.longest >= 30; break;
        case 'pomodoros_100': unlocked = totalPomodoros >= 100; break;
        case 'pomodoros_500': unlocked = totalPomodoros >= 500; break;
        case 'focus_1000': unlocked = totalFocusMinutes >= 1000; break;
        case 'day_8_pomodoros': unlocked = bestDay >= 8; break;
      }
      return { ...def, unlocked };
    });
  }, [dailyStats, streak]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-cream-300">Achievements</h3>
        <span className="text-[10px] text-gray-600 font-mono">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,248,230,0.06)' }}>
        <div
          className="h-full rounded-full will-change-[width]"
          style={{
            width: `${(unlockedCount / achievements.length) * 100}%`,
            background: 'linear-gradient(90deg, #FFD700, #FFA500)',
            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {achievements.map((a, i) => (
          <div
            key={a.id}
            className="flex flex-col items-center gap-1 p-2 rounded-lg relative group cursor-default"
            style={{
              background: a.unlocked ? 'rgba(255,248,230,0.06)' : 'rgba(255,248,230,0.02)',
              opacity: entered ? 1 : 0,
              transform: entered ? 'translateY(0)' : 'translateY(8px)',
              transition: `all 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 50}ms`,
            }}
            title={a.unlocked ? `${a.name}: ${a.description}` : '???'}
          >
            {/* Glow ring for unlocked */}
            {a.unlocked && (
              <div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  boxShadow: '0 0 8px rgba(255,215,0,0.15)',
                  animation: `glowPulse 3s ease-in-out infinite`,
                }}
              />
            )}

            <span
              className="text-lg relative z-10"
              style={{
                filter: a.unlocked ? 'none' : 'grayscale(1) blur(1px)',
                transform: a.unlocked ? 'scale(1)' : 'scale(0.85)',
                transition: 'all 0.4s ease',
              }}
            >
              {a.icon}
            </span>

            <span
              className="text-[9px] text-center leading-tight truncate w-full relative z-10"
              style={{
                color: a.unlocked ? 'rgba(255,248,230,0.5)' : 'rgba(255,248,230,0.2)',
              }}
            >
              {a.unlocked ? a.name : '???'}
            </span>

            {/* Hover tooltip */}
            <div
              className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg
                         bg-surface-3 border border-cream-100/10 text-[10px] text-cream-200
                         whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100
                         transition-opacity duration-200 z-50"
            >
              {a.unlocked ? a.description : '🔒 Locked'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
