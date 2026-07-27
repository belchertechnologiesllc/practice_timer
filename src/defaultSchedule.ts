import type { Block } from './types';

export const DEFAULT_TITLE = 'Practice #1';

const RAW_DEFAULT_BLOCKS: Array<Omit<Block, 'id'>> = [
  { n: 1, dur: 10, label: 'Warm Ups' },
  { n: 2, dur: 5, label: 'Agility' },
  { n: 3, dur: 5, label: 'Water' },
  { n: 4, dur: 10, label: 'Drill' },
];

export function createDefaultBlocks(): Block[] {
  return RAW_DEFAULT_BLOCKS.map((b) => ({ ...b, id: crypto.randomUUID() }));
}
