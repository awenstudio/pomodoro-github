/* ─────────────────────────────────────────────────────
 *  KeyboardHints — Floating shortcut overlay.
 *  Shows available keyboard shortcuts with icons.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';

interface Shortcut {
  key: string;
  label: string;
  icon: string;
}

const SHORTCUTS: Shortcut[] = [
  { key: 'Space', label: 'Play / Pause', icon: '⏯' },
  { key: 'R', label: 'Reset', icon: '🔄' },
  { key: 'S', label: 'Skip', icon: '⏭' },
  { key: '←', label: 'Previous Mode', icon: '◀' },
  { key: '→', label: 'Next Mode', icon: '▶' },
  { key: '?', label: 'Toggle Hints', icon: '❓' },
];

export function KeyboardHints() {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  const toggle = useCallback(() => {
    if (visible) {
      setEntered(false);
      setTimeout(() => setVisible(false), 200);
    } else {
      setVisible(true);
      setTimeout(() => setEntered(true), 10);
    }
  }, [visible]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Slash' && (e.shiftKey || e.key === '?')) {
        e.preventDefault();
        toggle();
      }
      if (e.code === 'Escape' && visible) {
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, toggle]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        opacity: entered ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
      onClick={toggle}
    >
      <div
        className="glass rounded-2xl p-4 mx-4"
        style={{
          background: 'rgba(26,24,20,0.95)',
          border: '1px solid rgba(255,248,230,0.1)',
          transform: entered ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          maxWidth: '280px',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xs font-medium text-cream-300 mb-3 text-center">
          Keyboard Shortcuts
        </h3>
        <div className="flex flex-col gap-2">
          {SHORTCUTS.map((s, i) => (
            <div
              key={s.key}
              className="flex items-center justify-between"
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateX(0)' : 'translateX(-8px)',
                transition: `all 0.3s ease ${i * 40}ms`,
              }}
            >
              <span className="text-xs text-gray-400">{s.icon} {s.label}</span>
              <kbd
                className="px-2 py-0.5 rounded-lg text-[10px] font-mono"
                style={{
                  background: 'rgba(255,248,230,0.06)',
                  border: '1px solid rgba(255,248,230,0.1)',
                  color: 'rgba(255,248,230,0.6)',
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-3">
          Press <kbd className="px-1 py-0.5 rounded bg-surface-3 text-gray-400">?</kbd> or <kbd className="px-1 py-0.5 rounded bg-surface-3 text-gray-400">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
