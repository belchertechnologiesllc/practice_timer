import type { Block } from './types';

export const DEFAULT_TITLE = 'Practice #1';

const RAW_DEFAULT_BLOCKS: Array<Omit<Block, 'id'>> = [
  { n: 1, dur: 5, label: 'Introductions' },
  { n: 2, dur: 10, label: 'Warm-Ups & Parent Meeting' },
  { n: 3, dur: 5, label: 'Water Break' },
  { n: 4, dur: 10, label: 'Group Rotation: Dash / Handoffs / Snap' },
  { n: 5, dur: 5, label: 'Water Break' },
  { n: 6, dur: 10, label: 'Drill Rotation' },
  { n: 7, dur: 5, label: 'Water Break' },
  { n: 8, dur: 10, label: 'Drill Rotation' },
  { n: 9, dur: 5, label: 'Water Break' },
  { n: 10, dur: 10, label: 'Drill Rotation' },
  { n: 11, dur: 5, label: 'Water Break' },
  { n: 12, dur: 10, label: 'Drill Rotation' },
  { n: 13, dur: 5, label: 'Water Break' },
  { n: 14, dur: 10, label: 'Drill Rotation' },
  { n: 15, dur: 5, label: 'Water Break' },
  { n: 16, dur: 10, label: 'Relay Race & Break Down' },
];

export function createDefaultBlocks(): Block[] {
  return RAW_DEFAULT_BLOCKS.map((b) => ({ ...b, id: crypto.randomUUID() }));
}
