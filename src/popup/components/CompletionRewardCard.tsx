/* ─────────────────────────────────────────────────────
 *  CompletionRewardCard — Shown after a focus session.
 *  Displays XP earned, pet mood change, streak info.
 *  Game design: action → reward → growth loop.
 *  UX: 150-300ms transitions, focus states, reduced motion.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect } from 'react';

interface CompletionRewardCardProps {
  xpEarned: number;
  petMoodChange: number;
  petName?: string;
  streakCount?: number;
  duration: number; // minutes
  onComplete: () => void; // dismiss callback
}

export function CompletionRewardCard({
  xpEarned,
  petMoodChange,
  petName,
  streakCount,
  duration,
  onComplete,
}: CompletionRewardCardProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 4000);
    const t3 = setTimeout(onComplete, 4300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const isPositive = petMoodChange >= 0;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 30 }}
    >
      <div
        className="rounded-2xl p-5 w-[280px] text-center relative overflow-hidden"
        style={{
          background: 'rgba(31,28,24,0.95)',
          border: '1px solid rgba(255,248,230,0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(90,175,94,0.15)',
          opacity: phase === 'enter' ? 0 : phase === 'exit' ? 0 : 1,
          transform: phase === 'enter' ? 'scale(0.8) translateY(20px)' : phase === 'exit' ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Warm glow background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(90,175,94,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Checkmark */}
        <div
          className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #5AAF5E, #4D8B3E)',
            boxShadow: '0 4px 20px rgba(90,175,94,0.4)',
            animation: 'rewardBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
          }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h3
          className="font-display font-bold text-cream-100 text-base mb-1"
          style={{ animation: 'rewardSlideUp 0.3s ease 0.3s both' }}
        >
          Great Focus! 🍅
        </h3>
        <p
          className="text-[11px] text-cream-400/50 mb-4"
          style={{ animation: 'rewardSlideUp 0.3s ease 0.35s both' }}
        >
          {duration} minute session complete
        </p>

        {/* Rewards */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* XP */}
          <div
            className="flex flex-col items-center gap-1"
            style={{ animation: 'rewardSlideUp 0.3s ease 0.4s both' }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(255,159,74,0.1)',
                border: '1px solid rgba(255,159,74,0.2)',
              }}
            >
              <span className="text-lg">⚡</span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-cream-200">+{xpEarned}</span>
            <span className="text-[9px] text-cream-400/30">XP</span>
          </div>

          {/* Pet Mood */}
          {petName && (
            <div
              className="flex flex-col items-center gap-1"
              style={{ animation: 'rewardSlideUp 0.3s ease 0.5s both' }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: isPositive ? 'rgba(90,175,94,0.1)' : 'rgba(255,107,107,0.1)',
                  border: `1px solid ${isPositive ? 'rgba(90,175,94,0.2)' : 'rgba(255,107,107,0.2)'}`,
                }}
              >
                <span className="text-lg">{isPositive ? '😊' : '😐'}</span>
              </div>
              <span className={`text-[11px] font-mono font-semibold ${isPositive ? 'text-moss-400' : 'text-cream-200'}`}>
                {petMoodChange >= 0 ? '+' : ''}{petMoodChange}
              </span>
              <span className="text-[9px] text-cream-400/30">{petName}'s mood</span>
            </div>
          )}

          {/* Streak */}
          {streakCount !== undefined && streakCount > 1 && (
            <div
              className="flex flex-col items-center gap-1"
              style={{ animation: 'rewardSlideUp 0.3s ease 0.6s both' }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,215,0,0.1)',
                  border: '1px solid rgba(255,215,0,0.2)',
                }}
              >
                <span className="text-lg">🔥</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-cream-200">{streakCount}</span>
              <span className="text-[9px] text-cream-400/30">day streak</span>
            </div>
          )}
        </div>

        {/* Dismiss hint */}
        <p
          className="text-[9px] text-cream-400/20"
          style={{ animation: 'rewardSlideUp 0.3s ease 0.7s both' }}
        >
          Auto-dismissing in a moment...
        </p>
      </div>
    </div>
  );
}
