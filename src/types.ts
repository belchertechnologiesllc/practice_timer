export interface Block {
  id: string;
  n: number;
  dur: number; // minutes
  label: string;
}

export type Phase = 'landing' | 'setup' | 'running';
