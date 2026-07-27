import type { Block } from '../types';
import { ScheduleRows } from './ScheduleRows';

interface Props {
  blocks: Block[];
  onLabelChange: (idx: number, val: string) => void;
  onDurChange: (idx: number, val: string) => void;
  onRemove: (idx: number) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
  onAddBlock: () => void;
  onDone: () => void;
}

export function EditorModal({ blocks, onLabelChange, onDurChange, onRemove, onReorder, onAddBlock, onDone }: Props) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Edit Schedule</div>
          <button type="button" className="btn btn-solid btn-compact" onClick={onDone}>
            Done
          </button>
        </div>
        <button type="button" className="btn btn-outline btn-full" onClick={onAddBlock}>
          + Add Block
        </button>
        <div className="row-list modal-row-list">
          <ScheduleRows
            blocks={blocks}
            onLabelChange={onLabelChange}
            onDurChange={onDurChange}
            onRemove={onRemove}
            onReorder={onReorder}
          />
        </div>
      </div>
    </div>
  );
}
