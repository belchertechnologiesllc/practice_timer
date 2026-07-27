import type { ThemeId } from './types';

export interface Theme {
  id: ThemeId;
  bg: string;
  text: string;
  accent: string;
  accentText: string;
  muted: string;
  tagBg: string;
  tagColor: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  navyGold: {
    id: 'navyGold',
    bg: '#0b1a33',
    text: '#f4efe2',
    accent: '#d4af37',
    accentText: '#0b1a33',
    muted: 'rgba(244,239,226,0.55)',
    tagBg: 'rgba(212,175,55,0.16)',
    tagColor: '#d4af37',
  },
  crimson: {
    id: 'crimson',
    bg: '#f5f2ef',
    text: '#1c1a19',
    accent: '#c81d25',
    accentText: '#fff',
    muted: 'rgba(28,26,25,0.55)',
    tagBg: '#fbe4e4',
    tagColor: '#a3161c',
  },
  steel: {
    id: 'steel',
    bg: '#eef1f4',
    text: '#16202c',
    accent: '#3a6ea5',
    accentText: '#fff',
    muted: 'rgba(22,32,44,0.55)',
    tagBg: '#dde6ef',
    tagColor: '#2c567f',
  },
  slate: {
    id: 'slate',
    bg: '#161826',
    text: '#e9e9ed',
    accent: '#9184d9',
    accentText: '#161826',
    muted: 'rgba(233,233,237,0.5)',
    tagBg: 'rgba(145,132,217,0.18)',
    tagColor: '#b3aae8',
  },
};

export const THEME_ORDER: ThemeId[] = ['navyGold', 'crimson', 'steel', 'slate'];
