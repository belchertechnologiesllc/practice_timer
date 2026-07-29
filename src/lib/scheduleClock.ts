import type { Block } from '../types';

/**
 * Advances (i, secs) by `elapsedSec` real seconds, walking across block
 * boundaries as needed and holding at 0 on the last block — the same
 * "catching up after being backgrounded" behavior used for both a
 * mid-session background/foreground cycle and restoring persisted state
 * after a full page reload. No beeps: the caller decides whether audio
 * cues make sense for the elapsed time it's covering (usually not).
 */
export function advanceByElapsed(
  blocks: Block[],
  i: number,
  secs: number,
  elapsedSec: number,
): { i: number; secs: number } {
  const lastIdx = blocks.length - 1;
  let remaining = Math.max(0, elapsedSec);
  while (remaining > 0) {
    if (secs > remaining) {
      secs -= remaining;
      remaining = 0;
    } else if (i < lastIdx) {
      remaining -= secs;
      i += 1;
      secs = blocks[i].dur * 60;
    } else {
      secs = 0;
      remaining = 0;
    }
  }
  return { i, secs };
}
