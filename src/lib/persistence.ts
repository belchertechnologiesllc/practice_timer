import type { Block, Phase } from '../types';

const STORAGE_KEY = 'practice-timer-state-v1';

export interface PersistedState {
  blocks: Block[];
  title: string;
  phase: Phase;
  i: number;
  secs: number;
  running: boolean;
  sound: boolean;
  /** Date.now() at the moment this was saved — lets a restore compute how much real time has passed. */
  savedAt: number;
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private browsing, quota) — state just won't survive a reload.
  }
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!Array.isArray(parsed.blocks) || parsed.blocks.length === 0) return null;
    if (typeof parsed.savedAt !== 'number') return null;
    return parsed as PersistedState;
  } catch {
    return null;
  }
}
