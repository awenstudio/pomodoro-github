/* ─────────────────────────────────────────────────────
 *  Stats — Daily/weekly statistics with heatmap,
 *  achievements, and session history.
 *  v2: Animated counters, staggered entrance, charts.
 * ───────────────────────────────────────────────────── */

import { useTimer } from '../hooks/useTimer';
import { Heatmap } from './Heatmap';
import { Achievements } from './Achievements';
import { loadDailyStats } from '@/lib/storage';
import { useState, useEffect, useRef } from 'react';
import type { DailyStats } from '@/types';

/* ── Animated Counter ──────────────────────────────── */

function AnimatedCounter({
  value,
  className,
  duration = 600,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    prev.current = value;
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}

export function Stats() {
  const { todayStats, streak, settings } = useTimer();
  const [allStats, setAllStats] = useState<Record<string, DailyStats>>({});
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    loadDailyStats().then(setAllStats);
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  const completedToday = todayStats?.completedPomodoros || 0;
  const focusMinutesToday = todayStats?.focusMinutes || 0;
  const goalProgress =
    settings.dailyGoal > 0 ? Math.min(1, completedToday / settings.dailyGoal) : 0;

  const weekStats = getWeekStats(allStats);
  const monthStats = getMonthStats(allStats);

  const stagger = (i: number): React.CSSProperties => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms`,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Today overview */}
      <div className="grid grid-cols-3 gap-2" style={stagger(0)}>
        <StatCard label="Pomodoros" value={completedToday} icon="🍅" accent="text-tea-400" />
        <StatCard label="Focus" value={`${focusMinutesToday}m`} icon="⏱" accent="text-amber-400" />
        <StatCard label="Streak" value={`${streak.current}d`} icon="🔥" accent="text-orange-400" />
      </div>

      {/* Daily goal progress */}
      <div className="glass rounded-2xl p-3" style={stagger(1)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-cream-300">Daily Goal</span>
          <span className="text-xs font-mono text-white">
            {completedToday}/{settings.dailyGoal}
          </span>
        </div>
        <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full will-change-[width] progress-bar"
            style={{
              width: `${goalProgress * 100}%`,
              background: 'linear-gradient(90deg, #5AAF5E, #7BC47A)',
              transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </div>
      </div>

      {/* Weekly / Monthly summary */}
      <div className="grid grid-cols-2 gap-2" style={stagger(2)}>
        <div className="glass rounded-2xl p-3 hover-lift cursor-default">
          <h3 className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">This Week</h3>
          <div className="text-lg font-light text-white">
            <AnimatedCounter value={weekStats.pomodoros} />
          </div>
          <div className="text-[10px] text-gray-500">{weekStats.minutes}m focus</div>
        </div>
        <div className="glass rounded-2xl p-3 hover-lift cursor-default">
          <h3 className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">This Month</h3>
          <div className="text-lg font-light text-white">
            <AnimatedCounter value={monthStats.pomodoros} />
          </div>
          <div className="text-[10px] text-gray-500">{monthStats.minutes}m focus</div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={stagger(3)}>
        <Heatmap dailyStats={allStats} />
      </div>

      {/* Session history (today) */}
      <div className="glass rounded-2xl p-3" style={stagger(4)}>
        <h3 className="text-xs font-medium text-cream-300 mb-2">Today's Sessions</h3>
        {todayStats?.sessions.length ? (
          <div className="flex flex-wrap gap-1.5">
            {todayStats.sessions.map((session, i) => (
              <div
                key={session.id || i}
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px]"
                style={{
                  background:
                    session.type === 'work'
                      ? session.completed
                        ? 'rgba(90,175,94,0.3)'
                        : 'rgba(90,175,94,0.1)'
                      : 'rgba(123,168,209,0.2)',
                  color:
                    session.type === 'work'
                      ? session.completed
                        ? '#7BC47A'
                        : '#5AAF5E'
                      : '#7BA8D1',
                  animation: `scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 40}ms both`,
                }}
                title={`${session.type} — ${session.completed ? 'completed' : 'interrupted'}`}
              >
                {session.type === 'work' ? '🍅' : '☕'}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600 italic">No sessions yet today</p>
        )}
      </div>

      {/* Achievements */}
      <div style={stagger(5)}>
        <Achievements dailyStats={allStats} streak={streak} />
      </div>

      {/* Streak info */}
      <div className="glass rounded-2xl p-3" style={stagger(6)}>
        <h3 className="text-xs font-medium text-cream-300 mb-2">Streak</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-light text-white">
              <AnimatedCounter value={streak.current} />
            </span>
            <span className="text-xs text-gray-500 ml-1">days</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Best: </span>
            <span className="text-sm font-mono text-white">{streak.longest}</span>
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
