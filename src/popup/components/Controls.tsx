/* ─────────────────────────────────────────────────────
 *  Controls — Start/Pause/Resume, Skip, Reset buttons
 *  with keyboard shortcuts.
 * ───────────────────────────────────────────────────── */

import { useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';

export function Controls() {
  const { isRunning, isPaused, isIdle, start, pause, resume, skip, reset } =
    useTimer();

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isRunning) pause();
          else if (isPaused) resume();
          else start();
          break;
        case 'KeyS':
          if (e.metaKey || e.ctrlKey) return;
          skip();
          break;
        case 'KeyR':
          if (e.metaKey || e.ctrlKey) return;
          reset();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRunning, isPaused, start, pause, resume, skip, reset]);

  return (
    <div className="flex items-center gap-3">
      {/* Reset */}
      <button
        onClick={reset}
        className="btn-secondary w-10 h-10 flex items-center justify-center"
        title="Reset (R)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* Play/Pause — primary action */}
      <button
        onClick={() => {
          if (isRunning) pause();
          else if (isPaused) resume();
          else start();
        }}
        className={`btn-primary w-14 h-14 flex items-center justify-center ${
          isRunning ? 'animate-glow' : ''
        }`}
        title="Start/Pause (Space)"
      >
        {isRunning ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {/* Skip */}
      <button
        onClick={skip}
        className="btn-secondary w-10 h-10 flex items-center justify-center"
        title="Skip (S)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <polygon points="5,4 15,12 5,20" fill="currentColor" />
          <line x1="19" y1="5" x2="19" y2="19" />
        </svg>
      </button>
    </div>
  );
}
