import type { Block } from '../types';

interface TimeState {
  hour: number | null;
  lastMin: number | null;
}

function timeToMinutes(str: string, tstate: TimeState): number | null {
  let hour: number;
  let min: number;
  if (str.startsWith(':')) {
    min = parseInt(str.slice(1), 10);
    hour = tstate.hour != null ? tstate.hour : 18;
  } else if (str.includes(':')) {
    const [h, m] = str.split(':').map(Number);
    hour = h < 12 ? h + 12 : h;
    min = m;
  } else {
    return null;
  }
  if (Number.isNaN(hour) || Number.isNaN(min)) return null;
  if (tstate.lastMin != null && min < tstate.lastMin) hour += 1;
  tstate.hour = hour;
  tstate.lastMin = min;
  return hour * 60 + min;
}

const ROW_RE = /^(\d{1,2})\s+(:?\d{1,2}(?::\d{2})?)\s*(.*)$/;

export function parseScheduleText(text: string): Block[] | null {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const tstate: TimeState = { hour: null, lastMin: null };
  const entries: { minutes: number; label: string }[] = [];
  for (const line of lines) {
    const m = line.match(ROW_RE);
    if (!m) continue;
    const minutes = timeToMinutes(m[2], tstate);
    if (minutes == null) continue;
    const rawLabel = m[3]
      .split(/\t+|\s{2,}/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(' / ');
    entries.push({ minutes, label: rawLabel });
  }
  if (!entries.length) return null;
  return entries.map((e, i) => {
    const nextMinutes = i + 1 < entries.length ? entries[i + 1].minutes : e.minutes + 10;
    const dur = Math.max(1, Math.min(60, nextMinutes - e.minutes || 10));
    let label = e.label || 'Drill Rotation';
    if (/^water$/i.test(label)) label = 'Water Break';
    return { n: i + 1, dur, label };
  });
}

function rowsToText(rows: unknown[][]): string {
  return rows
    .map((r) => r.map((c) => (c == null ? '' : String(c))).join('\t'))
    .join('\n');
}

const XLSX_CDN = 'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';
const PDF_PARSE_CDN = 'https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf-parse.es.js';
const PDF_WORKER_CDN = 'https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf.worker.min.mjs';

declare global {
  interface Window {
    XLSX?: {
      read: (data: ArrayBuffer, opts: { type: string }) => {
        SheetNames: string[];
        Sheets: Record<string, unknown>;
      };
      utils: {
        sheet_to_json: (sheet: unknown, opts: { header: number; raw: boolean }) => unknown[][];
      };
    };
  }
}

let xlsxLoad: Promise<void> | null = null;
function loadXlsx(): Promise<void> {
  if (window.XLSX) return Promise.resolve();
  if (!xlsxLoad) {
    xlsxLoad = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = XLSX_CDN;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load the spreadsheet parser.'));
      document.head.appendChild(script);
    });
  }
  return xlsxLoad;
}

/**
 * Parsers are loaded from CDN on demand rather than bundled: they're only
 * needed for the rare "import schedule" action, and the npm-published xlsx
 * package trails SheetJS's own (patched) releases.
 */
export async function importScheduleFile(file: File): Promise<Block[] | null> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) {
    const mod = await import(/* @vite-ignore */ PDF_PARSE_CDN);
    mod.PDFParse.setWorker(PDF_WORKER_CDN);
    const buf = await file.arrayBuffer();
    const parser = new mod.PDFParse({ data: new Uint8Array(buf) });
    const result = await parser.getText();
    return parseScheduleText(result.text);
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    await loadXlsx();
    const XLSX = window.XLSX!;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as unknown[][];
    return parseScheduleText(rowsToText(rows));
  }
  throw new Error('Please upload a PDF or Excel (.xlsx) file.');
}
