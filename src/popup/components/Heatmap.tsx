/* ─────────────────────────────────────────────────────
 *  Heatmap — Warm-toned focus intensity grid.
 *  v2: Hover tooltips, animated cells, smooth colors.
 * ───────────────────────────────────────────────────── */

import { useMemo, useState, useEffect } from 'react';
import type { DailyStats } from '@/types';

interface HeatmapProps {
  dailyStats: Record<string, DailyStats>;
}

const WEEKS = 12;
const DAYS = 7;
const CELL_SIZE = 12;
const CELL_GAP = 2;
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getColor(minutes: number): string {
  if (minutes === 0) return 'rgba(255,248,230,0.04)';
  if (minutes < 15) return 'rgba(90,175,94,0.25)';
  if (minutes < 30) return 'rgba(90,175,94,0.4)';
  if (minutes < 60) return 'rgba(90,175,94,0.6)';
  if (minutes < 90) return 'rgba(90,175,94,0.75)';
  return 'rgba(90,175,94,0.9)';
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function Heatmap({ dailyStats }: HeatmapProps) {
  const [entered, setEntered] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (WEEKS - 1) * 7 - dayOfWeek);

    const gridData: { date: string; minutes: number; col: number; row: number; label: string }[] = [];
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;

    for (let col = 0; col < WEEKS; col++) {
      for (let row = 0; row < DAYS; row++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + col * 7 + row);
        const dateStr = getDateString(cellDate);
        const stats = dailyStats[dateStr];
        const minutes = stats?.focusMinutes || 0;
        const pomodoros = stats?.completedPomodoros || 0;

        const month = cellDate.getMonth();
        if (month !== lastMonth && row === 0) {
          labels.push({
            label: cellDate.toLocaleString('en', { month: 'short' }),
            col,
          });
          lastMonth = month;
        }

        const dayLabel = cellDate.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
        const tooltip = minutes > 0
          ? `${dayLabel}: ${minutes}m focus, ${pomodoros} 🍅`
          : `${dayLabel}: No focus`;

        gridData.push({ date: dateStr, minutes, col, row, label: tooltip });
      }
    }

    return { grid: gridData, monthLabels: labels };
  }, [dailyStats]);

  const totalWidth = WEEKS * (CELL_SIZE + CELL_GAP) + 30;
  const totalHeight = DAYS * (CELL_SIZE + CELL_GAP) + 20;

  return (
    <div className="glass rounded-2xl p-3">
      <h3 className="text-xs font-display font-bold text-cream-200 mb-3">Focus Heatmap</h3>

      <div className="overflow-x-auto">
        <svg width={totalWidth} height={totalHeight} className="select-none">
          {monthLabels.map((m, i) => (
            <text key={i} x={30 + m.col * (CELL_SIZE + CELL_GAP)} y={10}
              fill="rgba(255,248,230,0.3)" fontSize="9">{m.label}</text>
          ))}
          {DAY_LABELS.map((label, i) =>
            label ? (
              <text key={i} x={0} y={22 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}
                fill="rgba(255,248,230,0.3)" fontSize="9" dominantBaseline="middle">{label}</text>
            ) : null,
          )}
          {grid.map((cell, i) => {
            const isHovered = hoveredCell === cell.date;
            return (
              <rect
                key={i}
                x={30 + cell.col * (CELL_SIZE + CELL_GAP)}
                y={18 + cell.row * (CELL_SIZE + CELL_GAP)}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                fill={getColor(cell.minutes)}
                style={{
                  opacity: entered ? 1 : 0,
                  transition: `opacity 0.3s ease ${i * 2}ms, fill 0.3s ease, transform 0.2s ease`,
                  transform: isHovered ? 'scale(1.4)' : 'scale(1)',
                  transformOrigin: `${30 + cell.col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}px ${18 + cell.row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}px`,
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredCell(cell.date)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                <title>{cell.label}</title>
              </rect>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[9px] text-gray-600">Less</span>
        {[0, 15, 30, 60, 90].map((m) => (
          <div
            key={m}
            className="w-2.5 h-2.5 rounded-sm"
            style={{ background: getColor(m) }}
          />
        ))}
        <span className="text-[9px] text-gray-600">More</span>
      </div>
    </div>
  );
}
