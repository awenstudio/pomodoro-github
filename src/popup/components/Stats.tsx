/* ─────────────────────────────────────────────────────
 *  Stats — Daily/weekly statistics with heatmap,
 *  achievements, and session history.
 * ───────────────────────────────────────────────────── */

import { useTimer } from '../hooks/useTimer';
import { Heatmap } from './Heatmap';
import { Achievements } from './Achievements';
import { loadDailyStats } from '@/lib/storage';
import { useState, useEffect } from 'react';
import type { DailyStats } from '@/types';

export function Stats() {
  const { todayStats, streak, settings } = useTimer();
  const [allStats, setAllStats] = useState<Record<string, DailyStats>>({});

  useEffect(() => {
    loadDailyStats().then(setAllStats);
  }, []);

  const completedToday = todayStats?.completedPomodoros || 0;
  const focusMinutesToday = todayStats?.focusMinutes || 0;
  const goalProgress =
    settings.dailyGoal > 0
      ? Math.min(1, completedToday / settings.dailyGoal)
      : 0;

  // Weekly stats
  const weekStats = getWeekStats(allStats);
  const monthStats = getMonthStats(allStats);

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Today overview */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          label="Pomodoros"
          value={completedToday}
          icon="🍅"
          accent="text-tea-400"
        />
        <StatCard
          label="Focus"
          value={`${focusMinutesToday}m`}
          icon="⏱"
          accent="text-amber-400"
        />
        <StatCard
          label="Streak"
          value={`${streak.current}d`}
          icon="🔥"
          accent="text-orange-400"
        />
      </div>

      {/* Daily goal progress */}
      <div className="glass rounded-2xl p-3 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-cream-300">Daily Goal</span>
          <span className="text-xs font-mono text-white">
            {completedToday}/{settings.dailyGoal}
          </span>
        </div>
        <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-moss-500 rounded-full transition-all duration-500"
            style={{ width: `${goalProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Weekly / Monthly summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass rounded-2xl p-3">
          <h3 className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            This Week
          </h3>
          <div className="text-lg font-light text-white">
            {weekStats.pomodoros}
          </div>
          <div className="text-[10px] text-gray-500">
            {weekStats.minutes}m focus
          </div>
        </div>
        <div className="glass rounded-2xl p-3">
          <h3 className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            This Month
          </h3>
          <div className="text-lg font-light text-white">
            {monthStats.pomodoros}
          </div>
          <div className="text-[10px] text-gray-500">
            {monthStats.minutes}m focus
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <Heatmap dailyStats={allStats} />

      {/* Session history (today) */}
      <div className="glass rounded-2xl p-3">
        <h3 className="text-xs font-medium text-cream-300 mb-2">
          Today's Sessions
        </h3>
        {todayStats?.sessions.length ? (
          <div className="flex flex-wrap gap-1.5">
            {todayStats.sessions.map((session, i) => (
              <div
                key={session.id || i}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${
                  session.type === 'work'
                    ? session.completed
                      ? 'bg-moss-600/30 text-tea-300'
                      : 'bg-moss-600/10 text-tea-500'
                    : 'bg-green-600/20 text-green-400'
                }`}
                title={`${session.type} — ${session.completed ? 'completed' : 'interrupted'}`}
              >
                {session.type === 'work' ? '🍅' : '☕'}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600 italic">
            No sessions yet today
          </p>
        )}
      </div>

      {/* Achievements */}
      <Achievements dailyStats={allStats} streak={streak} />

      {/* Streak info */}
      <div className="glass rounded-2xl p-3">
        <h3 className="text-xs font-medium text-cream-300 mb-2">Streak</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-light text-white">
              {streak.current}
            </span>
            <span className="text-xs text-gray-500 ml-1">days</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Best: </span>
            <span className="text-sm font-mono text-white">
              {streak.longest}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────── */

function getWeekStats(allStats: Record<string, DailyStats>) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);

  let pomodoros = 0;
  let minutes = 0;

  for (let i = 0; i <= dayOfWeek; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const key = d.toISOString().split('T')[0];
    const stats = allStats[key];
    if (stats) {
      pomodoros += stats.completedPomodoros;
      minutes += stats.focusMinutes;
    }
  }

  return { pomodoros, minutes };
}

function getMonthStats(allStats: Record<string, DailyStats>) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let pomodoros = 0;
  let minutes = 0;

  for (const [date, stats] of Object.entries(allStats)) {
    if (new Date(date) >= startOfMonth) {
      pomodoros += stats.completedPomodoros;
      minutes += stats.focusMinutes;
    }
  }

  return { pomodoros, minutes };
}

/* ── Stat Card ─────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: string;
}) {
  return (
    <div className="glass rounded-2xl p-3 text-center hover-lift cursor-default">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className={`text-xl font-light ${accent}`}>{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
