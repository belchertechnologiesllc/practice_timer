import type { Block } from '../types';

interface Props {
  blocks: Block[];
  onLabelChange: (idx: number, val: string) => void;
  onDurChange: (idx: number, val: string) => void;
  onRemove: (idx: number) => void;
}

export function ScheduleRows({ blocks, onLabelChange, onDurChange, onRemove }: Props) {
  return (
    <>
      {blocks.map((b, idx) => (
        <div className="row" key={idx}>
          <div className="row-n">{b.n}</div>
          <input
            type="text"
            className="row-label"
            value={b.label}
            onChange={(e) => onLabelChange(idx, e.target.value)}
            aria-label={`Block ${b.n} label`}
          />
          <input
            type="number"
            className="row-dur"
            value={b.dur}
            min={1}
            max={60}
            onChange={(e) => onDurChange(idx, e.target.value)}
            aria-label={`Block ${b.n} duration in minutes`}
          />
          <div className="row-min">min</div>
          <button
            type="button"
            className="row-remove"
            onClick={() => onRemove(idx)}
            aria-label={`Remove block ${b.n}`}
          >
            ×
          </button>
        </div>
      ))}
    </>
  );
}
