/* ─────────────────────────────────────────────────────
 *  Onboarding — Pawodoro first-time experience.
 *  Warm, cute, pet-focused. No login pressure.
 * ───────────────────────────────────────────────────── */

import { useState, useCallback } from 'react';
import { PetSprite } from './PetSprite';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: '🐾',
    title: 'Welcome to Pawodoro',
    description: 'A cozy focus timer with a pet companion. Work in focused sprints, watch your pet grow.',
  },
  {
    icon: '🐕',
    title: 'Your Pet Watches',
    description: 'Your pet stays with you while you focus. Complete pomodoros to earn XP, food, and love.',
  },
  {
    icon: '🌱',
    title: 'Grow Together',
    description: 'As you build focus habits, your pet evolves through 7 stages — from egg to legend.',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) onComplete();
    else setStep((s) => s + 1);
  }, [isLast, onComplete]);

  const current = STEPS[step];

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] p-6 animate-fade-in">
      {/* Step dots */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-moss-500' : i < step ? 'w-4 bg-moss-700' : 'w-4 bg-surface-3'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="mb-6 animate-bounce-gentle">
        {step === 0 ? (
          <PetSprite species="shiba-inu" animation="idle" size={96} />
        ) : step === 1 ? (
          <PetSprite species="shiba-inu" animation="focus" size={96} />
        ) : (
          <PetSprite species="shiba-inu" animation="hatch" size={96} />
        )}
      </div>
      <h2 className="text-xl font-semibold text-cream-100 mb-3 text-center">{current.title}</h2>
      <p className="text-sm text-gray-400 text-center max-w-[280px] mb-8 leading-relaxed">{current.description}</p>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-[240px]">
        <button onClick={handleNext} className="btn-primary w-full py-2.5 text-sm">
          {isLast ? "Let's Focus! 🐾" : 'Next'}
        </button>
        {!isLast && (
          <button onClick={onComplete} className="btn-ghost text-xs text-gray-500 w-full py-1.5">
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
