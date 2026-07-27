import type { Block } from '../types';
import type { Theme } from '../theme';

interface Props {
  theme: Theme;
  block: Block;
  next: Block | undefined;
  secs: number;
  running: boolean;
  sound: boolean;
  onToggleRun: () => void;
  onBack: () => void;
  onToggleSound: () => void;
}

export function RunningScreen({
  theme,
  block,
  next,
  secs,
  running,
  sound,
  onToggleRun,
  onBack,
  onToggleSound,
}: Props) {
  const isAlert = secs <= 5;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  const mainBg = isAlert ? theme.accent : 'transparent';
  const mainColor = isAlert ? theme.accentText : theme.text;
  const tagBg = isAlert ? 'rgba(255,255,255,0.2)' : theme.tagBg;
  const tagColor = isAlert ? theme.accentText : theme.tagColor;
  const nextColor = isAlert ? theme.accentText : theme.muted;

  return (
    <>
      <div className="countdown-area" style={{ background: mainBg, color: mainColor }}>
        <div className="countdown" aria-live="off">
          {mm}:{ss}
        </div>
        <div className="block-tag" style={{ background: tagBg, color: tagColor }}>
          {block.label}
        </div>
        <div className="next-line" style={{ color: nextColor }}>
          {next ? `Next: Block ${next.n} — ${next.label}` : 'Final block'}
        </div>
      </div>

      <div className="running-footer">
        <div className="sound-toggle" onClick={onToggleSound} role="button" tabIndex={0}>
          {sound ? 'Sound On' : 'Sound Off'}
        </div>
        <div className="footer-buttons">
          <button type="button" className="btn btn-outline" onClick={onBack}>
            Back
          </button>
          <button type="button" className="btn btn-solid btn-wide" onClick={onToggleRun}>
            {running ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>
    </>
  );
}
