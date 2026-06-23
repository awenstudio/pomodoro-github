/* ─────────────────────────────────────────────────────
 *  Controls — Pawodoro buttons with warm, soft feel.
 * ───────────────────────────────────────────────────── */

import { useEffect, useState } from 'react';
import { useTimer } from '../hooks/useTimer';

export function Controls() {
  const { isRunning, isPaused, start, pause, resume, skip, reset } = useTimer();
  const [ripple, setRipple] = useState(false);

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

  const handlePlayPause = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 500);
    if (isRunning) pause();
    else if (isPaused) resume();
    else start();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Reset */}
      <button
        onClick={reset}
        className="btn-secondary w-10 h-10 flex items-center justify-center
                   active:scale-90 transition-transform duration-100 rounded-full"
        title="Reset (R)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* Play/Pause — moss green, large, with ripple */}
      <button
        onClick={handlePlayPause}
        className={`btn-primary w-16 h-16 flex items-center justify-center relative overflow-hidden rounded-full
          ${isRunning ? 'animate-glow' : ''}
          active:scale-95 transition-transform duration-100`}
        title="Start/Pause (Space)"
      >
        {ripple && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-24 h-24 rounded-full bg-white/15 animate-ping" />
          </span>
        )}
        <span className="relative z-10">
          {isRunning ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </span>
      </button>

      {/* Skip */}
      <button
        onClick={skip}
        className="btn-secondary w-10 h-10 flex items-center justify-center
                   active:scale-90 transition-transform duration-100 rounded-full"
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
