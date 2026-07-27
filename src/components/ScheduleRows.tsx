import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Block } from '../types';

interface Props {
  blocks: Block[];
  onLabelChange: (idx: number, val: string) => void;
  onDurChange: (idx: number, val: string) => void;
  onRemove: (idx: number) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
}

interface RowProps {
  block: Block;
  onLabelChange: (val: string) => void;
  onDurChange: (val: string) => void;
  onRemove: () => void;
}

function SortableRow({ block, onLabelChange, onDurChange, onRemove }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  return (
    <div
      className={`row${isDragging ? ' row-dragging' : ''}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="row-handle"
        {...attributes}
        {...listeners}
        aria-label={`Reorder block ${block.n}`}
      >
        ⠿
      </button>
      <div className="row-n">{block.n}</div>
      <input
        type="text"
        className="row-label"
        value={block.label}
        onChange={(e) => onLabelChange(e.target.value)}
        aria-label={`Block ${block.n} label`}
      />
      <input
        type="number"
        className="row-dur"
        value={block.dur}
        min={1}
        max={60}
        onChange={(e) => onDurChange(e.target.value)}
        aria-label={`Block ${block.n} duration in minutes`}
      />
      <div className="row-min">min</div>
      <button type="button" className="row-remove" onClick={onRemove} aria-label={`Remove block ${block.n}`}>
        ×
      </button>
    </div>
  );
}

export function ScheduleRows({ blocks, onLabelChange, onDurChange, onRemove, onReorder }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = blocks.findIndex((b) => b.id === active.id);
    const toIdx = blocks.findIndex((b) => b.id === over.id);
    if (fromIdx !== -1 && toIdx !== -1) onReorder(fromIdx, toIdx);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.map((b, idx) => (
          <SortableRow
            key={b.id}
            block={b}
            onLabelChange={(val) => onLabelChange(idx, val)}
            onDurChange={(val) => onDurChange(idx, val)}
            onRemove={() => onRemove(idx)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
