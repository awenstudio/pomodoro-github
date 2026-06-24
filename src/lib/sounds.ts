/* ─────────────────────────────────────────────────────
 *  Sounds — Web Audio API sound effects.
 *  Synthesized, no external files needed.
 * ───────────────────────────────────────────────────── */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  ramp = true,
) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);

    if (ramp) {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

/* ── Public API ────────────────────────────────────── */

export function playStart() {
  playTone(523.25, 0.1, 'sine', 0.12); // C5
  setTimeout(() => playTone(659.25, 0.1, 'sine', 0.12), 80); // E5
  setTimeout(() => playTone(783.99, 0.15, 'sine', 0.15), 160); // G5
}

export function playPause() {
  playTone(783.99, 0.1, 'sine', 0.1); // G5
  setTimeout(() => playTone(523.25, 0.15, 'sine', 0.1), 80); // C5
}

export function playComplete() {
  // Success chime — ascending arpeggio
  playTone(523.25, 0.15, 'sine', 0.12); // C5
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.12), 120); // E5
  setTimeout(() => playTone(783.99, 0.15, 'sine', 0.12), 240); // G5
  setTimeout(() => playTone(1046.5, 0.3, 'sine', 0.18), 360); // C6
}

export function playSkip() {
  playTone(880, 0.08, 'sine', 0.08); // A5
}

export function playReset() {
  playTone(440, 0.08, 'sine', 0.08); // A4
  setTimeout(() => playTone(330, 0.12, 'sine', 0.08), 60); // E4
}

export function playPet() {
  // Cute pet sound
  playTone(880, 0.06, 'sine', 0.08);
  setTimeout(() => playTone(1108.73, 0.06, 'sine', 0.08), 60);
  setTimeout(() => playTone(880, 0.1, 'sine', 0.1), 120);
}

export function playFeed() {
  // Munch sound
  playTone(300, 0.05, 'square', 0.06);
  setTimeout(() => playTone(350, 0.05, 'square', 0.06), 80);
  setTimeout(() => playTone(400, 0.08, 'square', 0.08), 160);
}

export function playLevelUp() {
  // Celebration fanfare
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.12, 'sine', 0.12), i * 100);
  });
}
