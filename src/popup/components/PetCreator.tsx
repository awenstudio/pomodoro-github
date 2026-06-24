/* ─────────────────────────────────────────────────────
 *  PetCreator — First-time pet selection with AI art.
 *  v2: Animated selection, preview animations, spring.
 * ───────────────────────────────────────────────────── */

import { useState, useCallback, useEffect } from 'react';
import { PetSprite } from './PetSprite';
import type { PetSpecies } from '@/lib/pet-system';

interface PetCreatorProps {
  onCreate: (species: PetSpecies, name: string) => Promise<boolean>;
}

const STARTER_PETS: { species: PetSpecies; label: string; desc: string; emoji: string }[] = [
  { species: 'shiba', label: 'Shiba', desc: 'Loyal & playful', emoji: '🐕' },
  { species: 'cat', label: 'Cat', desc: 'Independent & curious', emoji: '🐱' },
  { species: 'rabbit', label: 'Rabbit', desc: 'Gentle & calm', emoji: '🐰' },
  { species: 'fox', label: 'Fox', desc: 'Clever & swift', emoji: '🦊' },
];

export function PetCreator({ onCreate }: PetCreatorProps) {
  const [selected, setSelected] = useState<PetSpecies>('shiba');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const ok = await onCreate(selected, name.trim());
      if (!ok) {
        setError('Something went wrong. Try reloading the extension.');
      }
    } catch {
      setError('Connection failed. Please reload the extension.');
    } finally {
      setLoading(false);
    }
  }, [selected, name, loading, onCreate]);

  const stagger = (i: number): React.CSSProperties => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms`,
  });

  const selectedPet = STARTER_PETS.find((p) => p.species === selected);

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      {/* Header */}
      <div className="text-center" style={stagger(0)}>
        <span className="text-3xl mb-2 block" style={{ animation: 'petBounce 2s ease-in-out infinite' }}>🐾</span>
        <h2 className="font-display text-lg font-bold text-cream-100 mb-1">Choose Your Companion</h2>
        <p className="text-xs text-cream-400/50">Your pet grows as you focus together.</p>
      </div>

      {/* Pet selection grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[260px]" style={stagger(1)}>
        {STARTER_PETS.map(({ species, label, desc, emoji }) => {
          const isSelected = selected === species;
          return (
            <button
              key={species}
              onClick={() => setSelected(species)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl relative overflow-hidden"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(90,175,94,0.15), rgba(90,175,94,0.05))'
                  : 'rgba(255,248,230,0.03)',
                border: `2px solid ${isSelected ? 'rgba(90,175,94,0.5)' : 'rgba(255,248,230,0.05)'}`,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected ? '0 4px 20px rgba(90,175,94,0.15)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Selection glow */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 50% 30%, rgba(90,175,94,0.1) 0%, transparent 70%)',
                  }}
                />
              )}
              <div style={{ transform: isSelected ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <PetSprite species={species} animation="static" size={64} className="mx-auto" />
              </div>
              <span className="text-xs text-cream-200 font-display font-medium relative z-10">{label}</span>
              <span className="text-[9px] text-cream-400/30 relative z-10">{desc}</span>
            </button>
          );
        })}
      </div>

      {/* Selected pet preview */}
      {selectedPet && (
        <div
          className="text-center"
          style={{
            ...stagger(2),
            animation: 'onboardingPetEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          <span className="text-xs text-cream-400/40">
            You selected: <span className="text-cream-100 font-display font-medium">{selectedPet.label}</span> {selectedPet.emoji}
          </span>
        </div>
      )}

      {/* Name input */}
      <div className="w-full max-w-[260px]" style={stagger(3)}>
        <label className="text-xs text-gray-400 mb-1 block">Give it a name</label>
        <input
          type="text"
          className="w-full px-3 py-2 bg-surface-2 border border-cream-100/10 rounded-xl
                     text-cream-100 text-sm focus:outline-none focus:border-moss-500
                     transition-all duration-300"
          placeholder="e.g. Mochi, Luna, Pixel..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          maxLength={20}
          autoFocus
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400 text-center animate-fade-in">{error}</p>
      )}

      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={!name.trim() || loading}
        className="w-full max-w-[260px] py-2.5 text-sm rounded-2xl font-medium
                   transition-all duration-300 flex items-center justify-center gap-2"
        style={{
          background: name.trim() && !loading
            ? 'linear-gradient(135deg, #5AAF5E, #3D8B41)'
            : 'rgba(90,175,94,0.2)',
          color: name.trim() && !loading ? 'white' : 'rgba(255,248,230,0.3)',
          boxShadow: name.trim() && !loading
            ? '0 4px 20px rgba(90,175,94,0.35)'
            : 'none',
          cursor: name.trim() && !loading ? 'pointer' : 'not-allowed',
          transform: name.trim() && !loading ? 'scale(1)' : 'scale(0.98)',
        }}
      >
        {loading ? (
          <>
            <span className="text-sm" style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            <span>Connecting...</span>
          </>
        ) : (
          'Start Together 🐾'
        )}
      </button>
    </div>
  );
}
