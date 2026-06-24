/* ─────────────────────────────────────────────────────
 *  Confetti — Lightweight celebration particle effect.
 *  Pure CSS + React, no external dependencies.
 * ───────────────────────────────────────────────────── */

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  velocity: { x: number; y: number };
  shape: 'square' | 'circle';
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
  particleCount?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
  '#FF8A8A', '#5AAF5E', '#7BA8D1', '#FFD700',
];

function generateParticles(count: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 40, // % from left
    y: -5 - Math.random() * 10, // start above viewport
    size: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    velocity: {
      x: (Math.random() - 0.5) * 3,
      y: 2 + Math.random() * 4,
    },
    shape: Math.random() > 0.5 ? 'square' : 'circle',
  }));
}

export function Confetti({
  active,
  onComplete,
  particleCount = 40,
  colors = DEFAULT_COLORS,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    const newParticles = generateParticles(particleCount, colors);
    setParticles(newParticles);
    setVisible(true);

    const timeout = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timeout);
  }, [active, particleCount, colors, onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.shape === 'square' ? p.size : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '1px',
            background: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall${p.id % 4} ${1.5 + Math.random()}s ease-out forwards`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}
