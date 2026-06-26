/* ─────────────────────────────────────────────────────
 *  PetDiary — Growth diary timeline view.
 *
 *  Shows pet's life milestones in a vertical timeline.
 *  Each entry has an icon, title, description, and date.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import type { Pet } from '@/lib/pet-system';
import { STAGE_NAMES } from '@/lib/pet-system';
import { generateDiaryEntries, type DiaryEntry } from '@/lib/pet-diary';

/* ── Entry card ────────────────────────────────────── */

function DiaryCard({ entry, index }: { entry: DiaryEntry; index: number }) {
  const date = new Date(entry.timestamp);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
  const typeColors: Record<string, string> = {
    milestone: '#FFD97A',
    special: '#FF8A8A',
    first: '#5AAF5E',
    daily: '#7BA8D1',
  };
  const color = typeColors[entry.type] || '#B8A88C';

  return (
    <div
      className="flex gap-3 items-start"
      style={{
        animation: `fadeInUp 0.3s ease ${index * 0.05}s both`,
      }}
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
          style={{
            background: `${color}20`,
            border: `1.5px solid ${color}40`,
            boxShadow: `0 0 6px ${color}15`,
          }}
        >
          {entry.icon}
        </div>
        {index < 50 && (
          <div className="w-px h-3" style={{ background: 'rgba(255,248,230,0.06)' }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-cream-100 font-display font-bold text-[11px]">{entry.title}</span>
          <span className="text-cream-400/30 text-[9px] font-display">{dateStr}</span>
        </div>
        <p className="text-cream-300/40 text-[10px] leading-relaxed">{entry.body}</p>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────── */

interface PetDiaryProps {
  pet: Pet;
}

export function PetDiary({ pet }: PetDiaryProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    setEntries(generateDiaryEntries(pet));
  }, [pet.xp, pet.totalPomodoros, pet.affinity]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">📖</span>
          <span className="text-cream-100 font-display font-bold text-sm">{pet.name}'s Diary</span>
        </div>
        <span className="text-cream-300/30 text-[10px] font-display">
          Lv.{pet.level} {STAGE_NAMES[pet.stage]}
        </span>
      </div>

      {/* Summary stats */}
      <div className="flex gap-2 px-3 mb-3">
        {[
          { icon: '🍅', value: pet.totalPomodoros, label: 'Pomodoros' },
          { icon: '⏱️', value: Math.floor(pet.totalFocusMinutes / 60), label: 'Hours' },
          { icon: '❤️', value: pet.affinity, label: 'Bond' },
        ].map((s) => (
          <div
            key={s.label}
            className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,248,230,0.03)', border: '1px solid rgba(255,248,230,0.04)' }}
          >
            <span className="text-xs">{s.icon}</span>
            <span className="text-cream-100 font-display font-bold text-[11px] tabular-nums">{s.value}</span>
            <span className="text-cream-400/30 text-[8px] font-display">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32">
            <span className="text-xl mb-2">📝</span>
            <span className="text-cream-300/30 text-[11px] font-display">No entries yet</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {[...entries].reverse().map((entry, i) => (
              <DiaryCard key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
