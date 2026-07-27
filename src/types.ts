export interface Block {
  id: string;
  n: number;
  dur: number; // minutes
  label: string;
}

export type ThemeId = 'navyGold' | 'crimson' | 'steel' | 'slate';

export type Phase = 'setup' | 'running';
