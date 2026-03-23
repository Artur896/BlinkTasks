/**
 * Sonido Web3 — dos tonos ascendentes con un leve shimmer.
 * Llamativo pero no agresivo.
 */
export function useNotificationSound() {
  const play = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      const tone = (freq, startTime, duration, vol = 0.13) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Shimmer — tono muy suave por encima para dar brillo
      const shimmer = (freq, startTime) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.03, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

        osc.start(startTime);
        osc.stop(startTime + 0.18);
      };

      const now = ctx.currentTime;

      // Primer tono: E5 (659 Hz)
      tone(659, now,        0.22, 0.11);
      shimmer(1318, now);              // octava por encima — brillo

      // Segundo tono: B5 (988 Hz) — intervalo de quinta ascendente
      tone(988, now + 0.16, 0.28, 0.13);
      shimmer(1976, now + 0.16);       // brillo del segundo tono

      setTimeout(() => ctx.close(), 700);
    } catch {
      // silencioso si el browser bloquea AudioContext
    }
  };

  return { play };
}