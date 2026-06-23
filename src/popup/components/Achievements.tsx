/* ─────────────────────────────────────────────────────
 *  Achievements — Milestone tracking and display.
 * ───────────────────────────────────────────────────── */

import { useMemo } from 'react';
import type { DailyStats, StreakData } from '@/types';
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/constants';

interface AchievementsProps {
  dailyStats: Record<string, DailyStats>;
  streak: StreakData;
}

export function Achievements({ dailyStats, streak }: AchievementsProps) {
  const achievements = useMemo(() => {
    const totalPomodoros = Object.values(dailyStats).reduce(
      (sum, d) => sum + d.completedPomodoros,
      0,
    );
    const totalFocusMinutes = Object.values(dailyStats).reduce(
      (sum, d) => sum + d.focusMinutes,
      0,
    );
    const bestDay = Math.max(
      0,
      ...Object.values(dailyStats).map((d) => d.completedPomodoros),
    );

    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      let unlocked = false;

      switch (def.id) {
        case 'first_pomodoro':
          unlocked = totalPomodoros >= 1;
          break;
        case 'streak_3':
          unlocked = streak.longest >= 3;
          break;
        case 'streak_7':
          unlocked = streak.longest >= 7;
          break;
        case 'streak_30':
          unlocked = streak.longest >= 30;
          break;
        case 'pomodoros_100':
          unlocked = totalPomodoros >= 100;
          break;
        case 'pomodoros_500':
          unlocked = totalPomodoros >= 500;
          break;
        case 'focus_1000':
          unlocked = totalFocusMinutes >= 1000;
          break;
        case 'day_8_pomodoros':
          unlocked = bestDay >= 8;
          break;
      }

      return { ...def, unlocked };
    });
  }, [dailyStats, streak]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-gray-400">Achievements</h3>
        <span className="text-[10px] text-gray-600">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
              a.unlocked
                ? 'bg-surface-3 hover:bg-surface-4'
                : 'bg-surface-1 opacity-40'
            }`}
            title={a.unlocked ? `${a.name}: ${a.description}` : '???'}
          >
            <span className={`text-lg ${a.unlocked ? '' : 'grayscale blur-[1px]'}`}>
              {a.icon}
            </span>
            <span className="text-[9px] text-gray-500 text-center leading-tight truncate w-full">
              {a.unlocked ? a.name : '???'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
