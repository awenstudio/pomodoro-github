/* ─────────────────────────────────────────────────────
 *  Stats — Daily/weekly statistics with heatmap,
 *  achievements, and session history.
 *  v3: New design system — Quicksand display font,
 *  warm glow accents, refined card hierarchy.
 * ───────────────────────────────────────────────────── */

import { useTimer } from '../hooks/useTimer';
import { Heatmap } from './Heatmap';
import { Achievements } from './Achievements';
import { PetDiary } from './PetDiary';
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

/* ── Main Stats Component ──────────────────────────── */

export function Stats() {
  const { dailyStats, streak, progress, settings, pet } = useTimer();
  const [allStats, setAllStats] = useState<Record<string, DailyStats>>({});
  const [subTab, setSubTab] = useState<'stats' | 'diary'>('stats');

  useEffect(() => {
    loadDailyStats().then(setAllStats);
  }, [dailyStats]);

  // Entrance animation
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  const stagger = (i: number): React.CSSProperties => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms`,
  });

  // Calculate totals
  const totalPomodoros = Object.values(allStats).reduce(
    (sum, d) => sum + d.completedPomodoros, 0,
  );
  const totalFocusMinutes = Object.values(allStats).reduce(
    (sum, d) => sum + d.focusMinutes, 0,
  );
  const totalFocusHours = Math.round(totalFocusMinutes / 60 * 10) / 10;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = allStats[todayStr] || {
    completedPomodoros: 0,
    focusMinutes: 0,
    breakMinutes: 0,
    sessions: [],
  };

  // Weekly data for mini chart
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      pomodoros: allStats[key]?.completedPomodoros || 0,
    };
  });
  const maxWeekPomodoros = Math.max(1, ...weekData.map((d) => d.pomodoros));

  return (
    <div className="flex flex-col gap-3 py-2">
      {/* Sub-tabs */}
      <div className="flex gap-1 px-1">
        {([['stats', '📊 Stats'], ['diary', '📖 Diary']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className="px-3 py-1 rounded-xl text-[10px] font-display font-medium transition-all duration-200"
            style={{
              background: subTab === id ? 'rgba(255,248,230,0.08)' : 'transparent',
              color: subTab === id ? '#FFF8E6' : 'rgba(255,248,230,0.3)',
              border: subTab === id ? '1px solid rgba(255,248,230,0.1)' : '1px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {subTab === 'diary' && pet ? (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,248,230,0.03)', border: '1px solid rgba(255,248,230,0.06)', height: 380 }}>
          <PetDiary pet={pet} />
        </div>
      ) : (
      <>
      {/* ── Today's Summary Card ── */}
      <div
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: 'rgba(255,248,230,0.03)',
          border: '1px solid rgba(255,248,230,0.06)',
          ...stagger(0),
        }}
      >
        {/* Warm glow accent */}
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(90,175,94,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📊</span>
          <h3 className="font-display text-sm font-bold text-cream-100">Today</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Focus"
            value={todayData.focusMinutes}
            unit="min"
            icon="🎯"
            color="#4D8B3E"
          />
          <StatCard
            label="Pomodoros"
            value={todayData.completedPomodoros}
            unit="🍅"
            icon="🍅"
            color="#E89B52"
          />
          <StatCard
            label="Streak"
            value={streak.current}
            unit="days"
            icon="🔥"
            color="#E86868"
          />
        </div>
      </div>

      {/* ── Weekly Mini Chart ── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(255,248,230,0.03)',
          border: '1px solid rgba(255,248,230,0.06)',
          ...stagger(1),
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📅</span>
          <h3 className="font-display text-sm font-bold text-cream-100">This Week</h3>
        </div>

        {/* Mini bar chart */}
        <div className="flex items-end gap-1.5 h-20 mb-2">
          {weekData.map((d, i) => {
            const height = d.pomodoros > 0
              ? Math.max(8, (d.pomodoros / maxWeekPomodoros) * 100)
              : 4;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    minHeight: d.pomodoros > 0 ? '8px' : '4px',
                    background: d.pomodoros > 0
                      ? `linear-gradient(180deg, #4D8B3E, #3D7030)`
                      : 'rgba(255,248,230,0.06)',
                    boxShadow: d.pomodoros > 0 ? '0 0 8px rgba(77,139,62,0.2)' : 'none',
                    transitionDelay: `${i * 50}ms`,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-1.5">
          {weekData.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] text-cream-400/30 font-medium">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── All-Time Stats ── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(255,248,230,0.03)',
          border: '1px solid rgba(255,248,230,0.06)',
          ...stagger(2),
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🏆</span>
          <h3 className="font-display text-sm font-bold text-cream-100">All Time</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AllTimeStat label="Total Focus" value={`${totalFocusHours}h`} icon="⏱️" />
          <AllTimeStat label="Pomodoros" value={totalPomodoros} icon="🍅" />
          <AllTimeStat label="Best Streak" value={`${streak.longest}d`} icon="🔥" />
          <AllTimeStat label="Total XP" value={progress.totalXP} icon="⭐" />
        </div>
      </div>

      {/* ── Heatmap ── */}
      <div style={stagger(3)}>
        <Heatmap dailyStats={allStats} />
      </div>

      {/* ── Achievements ── */}
      <div style={stagger(4)}>
        <Achievements dailyStats={allStats} streak={streak} />
      </div>
      </>
      )}
    </div>
  );
}

/* ── Sub-components ────────────────────────────────── */

function StatCard({
  label,
  value,
  unit,
  icon,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex flex-col items-center p-2.5 rounded-xl transition-all duration-300"
      style={{
        background: hovered ? `${color}08` : 'rgba(255,248,230,0.02)',
        border: `1px solid ${hovered ? `${color}15` : 'rgba(255,248,230,0.04)'}`,
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="text-lg mb-1 select-none">{icon}</span>
      <AnimatedCounter
        value={value}
        className="font-display text-xl font-bold tabular-nums"
      />
      <span className="text-[9px] text-cream-400/30 uppercase tracking-wider mt-0.5">
        {label}
      </span>
    </div>
  );
}

function AllTimeStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
      style={{
        background: 'rgba(255,248,230,0.02)',
        border: '1px solid rgba(255,248,230,0.04)',
      }}
    >
      <span className="text-base select-none">{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] text-cream-400/30 uppercase tracking-wider block">
          {label}
        </span>
        <span className="text-sm font-display font-bold text-cream-200/80">
          {value}
        </span>
      </div>
    </div>
  );
}
