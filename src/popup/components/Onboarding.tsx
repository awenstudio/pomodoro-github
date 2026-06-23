/* ─────────────────────────────────────────────────────
 *  Onboarding — First-time user experience.
 *  3-step guided introduction.
 * ───────────────────────────────────────────────────── */

import { useState, useCallback } from 'react';

interface OnboardingProps {
  onComplete: () => void;
  onConnectGoogle: () => void;
}

const STEPS = [
  {
    icon: '🍅',
    title: 'Welcome to Pomodoro',
    description:
      'A developer-focused timer that syncs with your Google account. Stay focused, track your progress, and build streaks.',
  },
  {
    icon: '☁️',
    title: 'Sync Across Devices',
    description:
      'Connect your Google account to sync data across all your devices. Your data is stored privately in your Google Drive.',
  },
  {
    icon: '🚀',
    title: 'Start Your First Focus',
    description:
      'Hit the play button to start a 25-minute focus session. Use Space to pause, S to skip, R to reset.',
  },
];

export function Onboarding({ onComplete, onConnectGoogle }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  }, [isLast, onComplete]);

  const current = STEPS[step];

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] p-6 animate-fade-in">
      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === step
                ? 'w-8 bg-tomato-500'
                : i < step
                  ? 'w-4 bg-tomato-700'
                  : 'w-4 bg-surface-3'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="text-5xl mb-6">{current.icon}</div>
      <h2 className="text-xl font-semibold text-white mb-3 text-center">
        {current.title}
      </h2>
      <p className="text-sm text-gray-400 text-center max-w-[280px] mb-8 leading-relaxed">
        {current.description}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-[240px]">
        {step === 1 && (
          <button
            onClick={() => {
              onConnectGoogle();
              handleNext();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl
                       bg-white hover:bg-gray-100 text-gray-800 text-sm font-medium
                       transition-colors duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        )}

        <button
          onClick={handleNext}
          className="btn-primary w-full py-2.5 text-sm"
        >
          {isLast ? "Let's Go!" : 'Next'}
        </button>

        {!isLast && (
          <button
            onClick={onComplete}
            className="btn-ghost text-xs text-gray-500 w-full py-1.5"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
