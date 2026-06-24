/* ─────────────────────────────────────────────────────
 *  Onboarding — Pawodoro first-time experience.
 *  Warm, cute, pet-focused. No login pressure.
 *  v2: Animated transitions, pet animations, swipe.
 * ───────────────────────────────────────────────────── */

import { useState, useCallback, useRef } from 'react';
import { PetSprite } from './PetSprite';
import type { AnimationType } from './PetSprite';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS: {
  icon: string;
  title: string;
  description: string;
  animation: AnimationType;
  petSize: number;
}[] = [
  {
    icon: '🐾',
    title: 'Welcome to Pawodoro',
    description: 'A cozy focus timer with a pet companion. Work in focused sprints, watch your pet grow.',
    animation: 'idle',
    petSize: 96,
  },
  {
    icon: '🎯',
    title: 'Focus Together',
    description: 'Your pet stays with you while you focus. Complete pomodoros to earn XP, food, and love.',
    animation: 'focus',
    petSize: 96,
  },
  {
    icon: '🌱',
    title: 'Grow Together',
    description: 'As you build focus habits, your pet evolves through 7 stages — from egg to legend.',
    animation: 'hatch',
    petSize: 112,
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const [exiting, setExiting] = useState(false);
  const isLast = step === STEPS.length - 1;
  const touchStartX = useRef(0);

  const handleNext = useCallback(() => {
    if (isLast) {
      setExiting(true);
      setTimeout(onComplete, 400);
      return;
    }
    setSlideDir('next');
    setStep((s) => s + 1);
  }, [isLast, onComplete]);

  const handleSkip = useCallback(() => {
    setExiting(true);
    setTimeout(onComplete, 400);
  }, [onComplete]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (dx < -60 && !isLast) handleNext();
      else if (dx > 60 && step > 0) {
        setSlideDir('prev');
        setStep((s) => s - 1);
      }
    },
    [isLast, step, handleNext],
  );

  const current = STEPS[step];

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[480px] p-6"
      style={{
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(0.95)' : 'scale(1)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Step dots */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: i === step ? 32 : 16,
              background:
                i === step
                  ? 'linear-gradient(90deg, #5AAF5E, #7BC47A)'
                  : i < step
                    ? 'rgba(90,175,94,0.4)'
                    : 'rgba(255,248,230,0.08)',
              boxShadow: i === step ? '0 0 8px rgba(90,175,94,0.3)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Pet animation with transition */}
      <div
        key={step}
        className="mb-6"
        style={{
          animation: 'onboardingPetEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        <div
          style={{
            animation: step === 2 ? 'petBounceComplete 0.8s ease-in-out 0.3s both' : undefined,
          }}
        >
          <PetSprite
            species="shiba-inu"
            animation={current.animation}
            size={current.petSize}
          />
        </div>
      </div>

      {/* Text with slide transition */}
      <div
        key={`text-${step}`}
        className="text-center mb-8"
        style={{
          animation: `${slideDir === 'next' ? 'onboardingSlideIn' : 'onboardingSlideInReverse'} 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
        }}
      >
        <div className="text-2xl mb-3">{current.icon}</div>
        <h2 className="text-xl font-semibold text-cream-100 mb-3">{current.title}</h2>
        <p className="text-sm text-gray-400 max-w-[280px] mx-auto leading-relaxed">
          {current.description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-[240px]">
        <button onClick={handleNext} className="btn-primary w-full py-2.5 text-sm active:scale-[0.96] transition-transform">
          {isLast ? "Let's Focus! 🐾" : 'Next'}
        </button>
        {!isLast && (
          <button onClick={handleSkip} className="btn-ghost text-xs text-gray-500 w-full py-1.5">
            Skip
          </button>
        )}
      </div>

      {/* Swipe hint */}
      {step === 0 && (
        <p className="text-[10px] text-gray-600 mt-6 animate-fade-in">
          ← swipe to navigate →
        </p>
      )}
    </div>
  );
}
