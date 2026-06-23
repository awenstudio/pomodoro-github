/* ─────────────────────────────────────────────────────
 *  Sound effects — Web Audio API for timer alerts.
 *  No external files needed, generates tones in-memory.
 * ───────────────────────────────────────────────────── */

const AudioCtx =
  typeof AudioContext !== 'undefined'
    ? AudioContext
    // @ts-expect-error — Safari fallback
    : typeof webkitAudioContext !== 'undefined'
      ? (window as any).webkitAudioContext
      : null;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!AudioCtx) return null;
  if (!ctx) {
    ctx = new AudioCtx();
  }
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration,
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

/**
 * Play a pleasant "pomodoro complete" chime.
 * Three ascending tones.
 */
export function playCompleteSound(): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  // Resume context (required after user gesture in Chrome)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  playTone(523.25, 0.2, 'sine', 0.25); // C5
  setTimeout(() => playTone(659.25, 0.2, 'sine', 0.25), 200); // E5
  setTimeout(() => playTone(783.99, 0.4, 'sine', 0.3), 400); // G5
}

/**
 * Play a soft "break over" tone.
 * Two descending tones.
 */
export function playBreakOverSound(): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  playTone(783.99, 0.15, 'sine', 0.2); // G5
  setTimeout(() => playTone(523.25, 0.3, 'sine', 0.2), 150); // C5
}

/**
 * Play a subtle click sound for button presses.
 */
export function playClickSound(): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  playTone(800, 0.05, 'sine', 0.1);
}
