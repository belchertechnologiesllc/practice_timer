import { useCallback, useRef } from 'react';
import type { RefObject } from 'react';
import countdownAudioUrl from '../assets/countdown-15s.mp3';

function getAudio(ref: RefObject<HTMLAudioElement | null>): HTMLAudioElement {
  if (!ref.current) {
    ref.current = new Audio(countdownAudioUrl);
    ref.current.preload = 'auto';
  }
  return ref.current;
}

/** Plays the "15 seconds remaining" countdown clip, unlocked the same way as useBeeper. */
export function useCountdownAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    const audio = getAudio(audioRef);
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }, []);

  const unlock = useCallback(() => {
    const audio = getAudio(audioRef);
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
      })
      .catch(() => {});
  }, []);

  return { play, unlock };
}
