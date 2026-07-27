import { THEMES, THEME_ORDER } from '../theme';
import type { ThemeId } from '../types';

interface Props {
  theme: ThemeId;
  onSelect: (id: ThemeId) => void;
}

export function ThemeSwatches({ theme, onSelect }: Props) {
  const current = THEMES[theme];
  return (
    <div className="swatch-row">
      {THEME_ORDER.map((id) => (
        <button
          key={id}
          type="button"
          aria-label={`${id} theme`}
          aria-pressed={theme === id}
          className="swatch"
          style={{
            background: THEMES[id].accent,
            borderColor: theme === id ? current.text : 'transparent',
          }}
          onClick={() => onSelect(id)}
        />
      ))}
    </div>
  );
}
