/* ─────────────────────────────────────────────────────
 *  Pet Component — Displays the pet with stage-based
 *  emoji, mood indicator, and interaction buttons.
 * ───────────────────────────────────────────────────── */

import { useState, useCallback } from 'react';
import type { Pet } from '@/lib/pet-system';
import { SPECIES_CONFIG, STAGE_NAMES, getPersonalityGreeting } from '@/lib/pet-system';

interface PetDisplayProps {
  pet: Pet;
  onFeed: () => void;
  onPlay: () => void;
  onPet: () => void;
  isRunning: boolean;
}

export function PetDisplay({ pet, onFeed, onPlay, onPet, isRunning }: PetDisplayProps) {
  const [showGreeting, setShowGreeting] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [interactionEffect, setInteractionEffect] = useState<string | null>(null);

  const species = SPECIES_CONFIG[pet.species];
  const emoji = species.stages[pet.stage];
  const stageName = STAGE_NAMES[pet.stage];

  const handlePetClick = useCallback(() => {
    const msg = getPersonalityGreeting(pet.personality);
    setGreeting(msg);
    setShowGreeting(true);
    setTimeout(() => setShowGreeting(false), 3000);
    onPet();
  }, [pet.personality, onPet]);

  const handleFeed = useCallback(() => {
    setInteractionEffect('❤️');
    setTimeout(() => setInteractionEffect(null), 1000);
    onFeed();
  }, [onFeed]);

  const handlePlay = useCallback(() => {
    setInteractionEffect('⭐');
    setTimeout(() => setInteractionEffect(null), 1000);
    onPlay();
  }, [onPlay]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Pet name & stage */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{pet.name}</span>
        <span className="text-[10px] text-gray-600 bg-surface-3 px-1.5 py-0.5 rounded-full">
          {stageName}
        </span>
        <span className="text-[10px] text-gray-600">
          Lv.{pet.level}
        </span>
      </div>

      {/* Pet emoji with animations */}
      <div
        className={`relative text-6xl cursor-pointer select-none
          transition-transform duration-300
          ${isRunning ? 'animate-float' : 'hover:scale-110'}
        `}
        onClick={handlePetClick}
        title="Click to interact"
      >
        {/* Sleeping animation when idle */}
        {pet.mood < 30 && !isRunning && (
          <span className="absolute -top-2 -right-2 text-sm animate-bounce">
            💤
          </span>
        )}

        {/* Happy sparkles when mood high */}
        {pet.mood >= 80 && (
          <span className="absolute -top-1 -left-1 text-xs animate-pulse">✨</span>
        )}

        {/* Interaction effect */}
        {interactionEffect && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
            {interactionEffect}
          </span>
        )}

        {/* Main pet */}
        <span className={`inline-block ${isRunning ? 'animate-pulse' : ''}`}>
          {emoji}
        </span>
      </div>

      {/* Speech bubble */}
      {showGreeting && (
        <div className="animate-fade-in glass rounded-xl px-3 py-1.5 max-w-[200px]">
          <p className="text-[11px] text-gray-300 text-center leading-relaxed">
            {greeting}
          </p>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1" title={`Mood: ${pet.mood}/100`}>
          <span>{pet.mood >= 70 ? '😊' : pet.mood >= 40 ? '😐' : '😢'}</span>
          <div className="w-12 h-1 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pet.mood >= 70 ? 'bg-green-400' : pet.mood >= 40 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${pet.mood}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1" title={`Hunger: ${pet.hunger}/100`}>
          <span>{pet.hunger >= 60 ? '🍖' : pet.hunger >= 30 ? '🍗' : '😰'}</span>
          <div className="w-12 h-1 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pet.hunger >= 60 ? 'bg-green-400' : pet.hunger >= 30 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${pet.hunger}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1" title={`Affinity: ${pet.affinity}/10000`}>
          <span>💕</span>
          <span className="text-gray-500 font-mono">{Math.floor(pet.affinity / 100)}%</span>
        </div>
      </div>

      {/* Interaction buttons (only when not running) */}
      {!isRunning && (
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleFeed}
            disabled={pet.food <= 0}
            className="btn-ghost text-[10px] px-2 py-1 flex items-center gap-1
                       disabled:opacity-30 disabled:cursor-not-allowed"
            title={`Feed (${pet.food} food left)`}
          >
            🍖 Feed
            <span className="text-gray-600">{pet.food}</span>
          </button>
          <button
            onClick={handlePlay}
            className="btn-ghost text-[10px] px-2 py-1 flex items-center gap-1"
            title="Play"
          >
            ⚽ Play
          </button>
          <button
            onClick={handlePetClick}
            className="btn-ghost text-[10px] px-2 py-1"
            title="Pet"
          >
            🤲 Pet
          </button>
        </div>
      )}
    </div>
  );
}
