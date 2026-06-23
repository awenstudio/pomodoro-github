/* ─────────────────────────────────────────────────────
 *  Stats — Daily/weekly statistics with charts,
 *  heatmap, and achievement display.
 * ───────────────────────────────────────────────────── */

import { useTimer } from '../hooks/useTimer';

export function Stats() {
  const { todayStats, streak, settings } = useTimer();

  const completedToday = todayStats?.completedPomodoros || 0;
  const focusMinutesToday = todayStats?.focusMinutes || 0;
  const goalProgress = settings.dailyGoal > 0
    ? Math.min(1, completedToday / settings.dailyGoal)
    : 0;

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Today overview */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          label="Pomodoros"
          value={completedToday}
          icon="🍅"
          accent="text-tomato-400"
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
      <div className="glass rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Daily Goal</span>
          <span className="text-xs font-mono text-white">
            {completedToday}/{settings.dailyGoal}
          </span>
        </div>
        <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-tomato-500 rounded-full transition-all duration-500"
            style={{ width: `${goalProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Session history (today) */}
      <div className="glass rounded-xl p-3">
        <h3 className="text-xs font-medium text-gray-400 mb-2">Today's Sessions</h3>
        {todayStats?.sessions.length ? (
          <div className="flex flex-wrap gap-1.5">
            {todayStats.sessions.map((session, i) => (
              <div
                key={session.id || i}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${
                  session.type === 'work'
                    ? session.completed
                      ? 'bg-tomato-600/30 text-tomato-300'
                      : 'bg-tomato-600/10 text-tomato-600'
                    : 'bg-green-600/20 text-green-400'
                }`}
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

      {/* Streak info */}
      <div className="glass rounded-xl p-3">
        <h3 className="text-xs font-medium text-gray-400 mb-2">Streak</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-light text-white">{streak.current}</span>
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
    <div className="glass rounded-xl p-3 text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className={`text-xl font-light ${accent}`}>{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
