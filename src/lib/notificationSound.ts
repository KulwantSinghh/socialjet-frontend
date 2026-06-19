/**
 * Plays a short two-note notification chime using the Web Audio API.
 *
 * No audio asset is required. Browsers block audio until the user has
 * interacted with the page at least once, so the very first chime may be
 * silent — every subsequent one will play.
 */

// Reuse a single AudioContext across calls to avoid exhausting the browser limit.
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;

  if (!audioContext) {
    audioContext = new Ctx();
  }
  return audioContext;
}

export function playNotificationSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume if the context was suspended by the browser's autoplay policy.
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  // Two ascending notes for a gentle "ding-dong" feel.
  const notes = [
    { freq: 880, start: 0, duration: 0.16 }, // A5
    { freq: 1174.66, start: 0.13, duration: 0.22 }, // D6
  ];

  for (const note of notes) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = note.freq;

    const startAt = ctx.currentTime + note.start;
    const endAt = startAt + note.duration;

    // Quick attack, smooth exponential decay.
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startAt);
    oscillator.stop(endAt);
  }
}
