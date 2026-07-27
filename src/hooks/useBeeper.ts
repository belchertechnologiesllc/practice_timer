import { useRef, useCallback } from 'react';
import type { RefObject } from 'react';

type AudioCtxCtor = typeof AudioContext;

function getAudioCtx(ctxRef: RefObject<AudioContext | null>): AudioContext {
  const AudioCtx =
    window.AudioContext || (window as unknown as { webkitAudioContext: AudioCtxCtor }).webkitAudioContext;
  const ctx = ctxRef.current ?? new AudioCtx();
  ctxRef.current = ctx;
  return ctx;
}

export function useBeeper() {
  const ctxRef = useRef<AudioContext | null>(null);

  const beep = useCallback((freq: number) => {
    try {
      const ctx = getAudioCtx(ctxRef);
      if (ctx.state === 'suspended') void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Web Audio unavailable — sound is a nice-to-have, never block the timer on it.
    }
  }, []);

  /**
   * Mobile browsers only let a page play audio if the AudioContext was
   * created/resumed from inside a real user-gesture handler (a click/tap).
   * Our beeps otherwise fire from a setInterval tick, which isn't a gesture,
   * so without this the context stays silently suspended forever. Call this
   * synchronously from onClick handlers that are about to start a countdown
   * (Start Practice, Resume) so later tick-triggered beeps are audible.
   */
  const unlock = useCallback(() => {
    try {
      const ctx = getAudioCtx(ctxRef);
      if (ctx.state === 'suspended') void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
    } catch {
      // Best-effort unlock; a failure here just means beep() may be silent.
    }
  }, []);

  return { beep, unlock };
}
