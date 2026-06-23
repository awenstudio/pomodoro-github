/* ─────────────────────────────────────────────────────
 *  PetCreator — First-time pet selection.
 *  User picks a starter pet and names it.
 * ───────────────────────────────────────────────────── */

import { useState } from 'react';
import { SPECIES_CONFIG } from '@/lib/pet-system';
import type { PetSpecies } from '@/lib/pet-system';

interface PetCreatorProps {
  onCreate: (species: PetSpecies, name: string) => void;
}

const STARTER_PETS: PetSpecies[] = ['shiba', 'cat', 'rabbit', 'fox'];

export function PetCreator({ onCreate }: PetCreatorProps) {
  const [selected, setSelected] = useState<PetSpecies>('shiba');
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(selected, name.trim());
  };

  return (
    <div className="flex flex-col items-center gap-5 p-4 animate-fade-in">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-1">Choose Your Pet</h2>
        <p className="text-xs text-gray-400">
          Your companion will grow as you focus.
        </p>
      </div>

      {/* Pet selection grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[240px]">
        {STARTER_PETS.map((species) => {
          const config = SPECIES_CONFIG[species];
          const isSelected = selected === species;
          return (
            <button
              key={species}
              onClick={() => setSelected(species)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200
                ${isSelected
                  ? 'bg-tomato-600/20 border-2 border-tomato-500 scale-105'
                  : 'glass border-2 border-transparent hover:border-white/10 active:scale-95'
                }`}
            >
              <span className="text-4xl">{config.stages.baby}</span>
              <span className="text-xs text-white font-medium">{config.name}</span>
              <span className="text-[9px] text-gray-500">{config.rarity}</span>
            </button>
          );
        })}
      </div>

      {/* Name input */}
      <div className="w-full max-w-[240px]">
        <label className="text-xs text-gray-400 mb-1 block">Give it a name</label>
        <input
          type="text"
          className="w-full px-3 py-2 bg-surface-2 border border-white/10 rounded-lg
                     text-white text-sm focus:outline-none focus:border-tomato-500
                     transition-colors duration-150"
          placeholder="e.g. Mochi, Luna, Pixel..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          autoFocus
        />
      </div>

      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={!name.trim()}
        className="btn-primary w-full max-w-[240px] py-2.5 text-sm
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start Together 🍅
      </button>
    </div>
  );
}
