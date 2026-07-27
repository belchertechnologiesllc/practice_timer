import { useRef, useState } from 'react';
import type { Block } from '../types';
import { ScheduleRows } from './ScheduleRows';
import { importScheduleFile } from '../lib/importSchedule';

interface Props {
  title: string;
  onTitleChange: (val: string) => void;
  blocks: Block[];
  onLabelChange: (idx: number, val: string) => void;
  onDurChange: (idx: number, val: string) => void;
  onRemove: (idx: number) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
  onAddBlock: () => void;
  onStart: () => void;
  onImport: (blocks: Block[]) => void;
}

export function SetupScreen({
  title,
  onTitleChange,
  blocks,
  onLabelChange,
  onDurChange,
  onRemove,
  onReorder,
  onAddBlock,
  onStart,
  onImport,
}: Props) {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const imported = await importScheduleFile(file);
      if (!imported) {
        alert('Could not detect a schedule in that file — try editing blocks manually below.');
      } else {
        onImport(imported);
      }
    } catch {
      alert('Could not read that file — you can still edit the schedule manually below.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="setup-screen">
      <div className="section-heading">Set Up Practice</div>
      <input
        type="text"
        className="title-input"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Practice title"
      />
      <div className="import-label">
        {importing ? 'Reading file…' : 'Import schedule from PDF or Excel (review after import)'}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.xls"
        onChange={handleFile}
        disabled={importing}
        className="file-input"
      />
      <div className="row-list">
        <ScheduleRows
          blocks={blocks}
          onLabelChange={onLabelChange}
          onDurChange={onDurChange}
          onRemove={onRemove}
          onReorder={onReorder}
        />
      </div>
      <div className="footer-buttons">
        <button type="button" className="btn btn-outline" onClick={onAddBlock}>
          + Add Block
        </button>
        <button type="button" className="btn btn-solid btn-wide" onClick={onStart} disabled={blocks.length === 0}>
          Start Practice
        </button>
      </div>
    </div>
  );
}
