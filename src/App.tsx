import { useEffect, useReducer, useRef } from 'react';
import type { CSSProperties } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { Block, Phase } from './types';
import { createDefaultBlocks, DEFAULT_TITLE } from './defaultSchedule';
import { THEME } from './theme';
import { useBeeper } from './hooks/useBeeper';
import { useCountdownAudio } from './hooks/useCountdownAudio';
import { useWakeLock } from './hooks/useWakeLock';
import { Header } from './components/Header';
import { SetupScreen } from './components/SetupScreen';
import { RunningScreen } from './components/RunningScreen';
import { EditorModal } from './components/EditorModal';
import './App.css';

interface State {
  blocks: Block[];
  title: string;
  phase: Phase;
  i: number;
  secs: number;
  running: boolean;
  sound: boolean;
  showEditor: boolean;
  beepSeq: number;
  beepKind: 'warn' | 'advance' | null;
}

function freshState(): State {
  const blocks = createDefaultBlocks();
  return {
    blocks,
    title: DEFAULT_TITLE,
    phase: 'setup',
    i: 0,
    secs: blocks[0].dur * 60,
    running: false,
    sound: true,
    showEditor: false,
    beepSeq: 0,
    beepKind: null,
  };
}

type Action =
  | { type: 'SET_TITLE'; val: string }
  | { type: 'SET_BLOCK_LABEL'; idx: number; val: string }
  | { type: 'SET_BLOCK_DUR'; idx: number; val: string }
  | { type: 'ADD_BLOCK' }
  | { type: 'REMOVE_BLOCK'; idx: number }
  | { type: 'REORDER_BLOCKS'; fromIdx: number; toIdx: number }
  | { type: 'IMPORT_BLOCKS'; blocks: Block[] }
  | { type: 'START_PRACTICE' }
  | { type: 'NEW_PRACTICE' }
  | { type: 'TOGGLE_RUN' }
  | { type: 'BACK' }
  | { type: 'SKIP' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'OPEN_EDITOR' }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'TICK'; elapsedSec: number };

/** Keeps `i` pointing at the same logical block (by id) after the list is added to, removed from, or reordered. */
function reindexAfterChange(prevBlocks: Block[], prevIndex: number, newBlocks: Block[]): number {
  const currentId = prevBlocks[prevIndex]?.id;
  const found = currentId ? newBlocks.findIndex((b) => b.id === currentId) : -1;
  if (found !== -1) return found;
  return Math.max(Math.min(prevIndex, newBlocks.length - 1), 0);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.val };
    case 'SET_BLOCK_LABEL':
      return {
        ...state,
        blocks: state.blocks.map((b, j) => (j === action.idx ? { ...b, label: action.val } : b)),
      };
    case 'SET_BLOCK_DUR': {
      const dur = Math.max(1, Math.min(60, parseInt(action.val, 10) || 1));
      return {
        ...state,
        blocks: state.blocks.map((b, j) => (j === action.idx ? { ...b, dur } : b)),
      };
    }
    case 'ADD_BLOCK':
      return {
        ...state,
        blocks: [
          ...state.blocks,
          { id: crypto.randomUUID(), n: state.blocks.length + 1, dur: 5, label: 'New Block' },
        ],
      };
    case 'REMOVE_BLOCK': {
      const blocks = state.blocks.filter((_, j) => j !== action.idx).map((b, j) => ({ ...b, n: j + 1 }));
      const i = reindexAfterChange(state.blocks, state.i, blocks);
      return { ...state, blocks, i, secs: blocks.length ? blocks[i].dur * 60 : 0 };
    }
    case 'REORDER_BLOCKS': {
      const blocks = arrayMove(state.blocks, action.fromIdx, action.toIdx).map((b, j) => ({ ...b, n: j + 1 }));
      const i = reindexAfterChange(state.blocks, state.i, blocks);
      return { ...state, blocks, i, secs: blocks.length ? blocks[i].dur * 60 : 0 };
    }
    case 'IMPORT_BLOCKS':
      return {
        ...state,
        blocks: action.blocks,
        phase: 'setup',
        i: 0,
        secs: action.blocks[0].dur * 60,
        running: false,
      };
    case 'START_PRACTICE':
      return { ...state, phase: 'running', i: 0, secs: state.blocks[0].dur * 60, running: true };
    case 'NEW_PRACTICE':
      return freshState();
    case 'TOGGLE_RUN':
      return { ...state, running: !state.running };
    case 'BACK': {
      const prevI = Math.max(state.i - 1, 0);
      return { ...state, i: prevI, secs: state.blocks[prevI].dur * 60 };
    }
    case 'SKIP': {
      const lastIdx = state.blocks.length - 1;
      const nextI = Math.min(state.i + 1, lastIdx);
      const advanced = nextI !== state.i;
      return {
        ...state,
        i: nextI,
        secs: state.blocks[nextI].dur * 60,
        beepKind: advanced ? 'advance' : state.beepKind,
        beepSeq: advanced ? state.beepSeq + 1 : state.beepSeq,
      };
    }
    case 'TOGGLE_SOUND':
      return { ...state, sound: !state.sound };
    case 'OPEN_EDITOR':
      return { ...state, showEditor: true, running: false };
    case 'CLOSE_EDITOR': {
      const i = Math.max(Math.min(state.i, state.blocks.length - 1), 0);
      return { ...state, i, showEditor: false, secs: state.blocks.length ? state.blocks[i].dur * 60 : 0 };
    }
    case 'TICK': {
      if (!state.running || state.phase !== 'running') return state;
      const elapsed = action.elapsedSec;
      if (elapsed <= 0) return state;
      let i = state.i;
      let secs = state.secs;
      let beepKind: 'warn' | 'advance' | null = null;
      const lastIdx = state.blocks.length - 1;

      if (elapsed === 1) {
        if (secs <= 1) {
          if (i < lastIdx) {
            i += 1;
            secs = state.blocks[i].dur * 60;
            beepKind = 'advance';
          } else {
            secs = 0;
          }
        } else {
          if (secs === 15) beepKind = 'warn';
          secs -= 1;
        }
      } else {
        // Catching up after the tab/screen was backgrounded — fast-forward
        // silently rather than replaying every missed second's beep.
        let remaining = elapsed;
        while (remaining > 0) {
          if (secs > remaining) {
            secs -= remaining;
            remaining = 0;
          } else if (i < lastIdx) {
            remaining -= secs;
            i += 1;
            secs = state.blocks[i].dur * 60;
          } else {
            secs = 0;
            remaining = 0;
          }
        }
      }

      return {
        ...state,
        i,
        secs,
        beepKind,
        beepSeq: beepKind ? state.beepSeq + 1 : state.beepSeq,
      };
    }
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, freshState);
  const { beep, unlock: unlockBeep } = useBeeper();
  const { play: playCountdown, unlock: unlockCountdown } = useCountdownAudio();
  const lastTickRef = useRef<number>(Date.now());

  useWakeLock(state.phase === 'running' && state.running);

  function unlockAudio() {
    unlockBeep();
    unlockCountdown();
  }

  useEffect(() => {
    if (!state.beepKind || !state.sound) return;
    if (state.beepKind === 'advance') beep(880);
    else if (state.beepKind === 'warn') playCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.beepSeq]);

  useEffect(() => {
    if (!(state.phase === 'running' && state.running)) return;
    lastTickRef.current = Date.now();

    function runTick() {
      const now = Date.now();
      const elapsedSec = Math.floor((now - lastTickRef.current) / 1000);
      if (elapsedSec < 1) return;
      lastTickRef.current += elapsedSec * 1000;
      dispatch({ type: 'TICK', elapsedSec });
    }

    const id = window.setInterval(runTick, 250);
    document.addEventListener('visibilitychange', runTick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', runTick);
    };
  }, [state.phase, state.running]);

  const theme = THEME;
  const block = state.blocks[state.i];
  const next = state.blocks[state.i + 1];
  const isRunningPhase = state.phase === 'running';

  function handleNewPractice() {
    if (state.phase === 'running' && !window.confirm('Start a new practice? This will replace the current schedule.')) {
      return;
    }
    dispatch({ type: 'NEW_PRACTICE' });
  }

  return (
    <div
      className="phone-shell"
      style={
        {
          background: theme.bg,
          color: theme.text,
          '--accent': theme.accent,
          '--accent-text': theme.accentText,
          '--bg': theme.bg,
          '--text': theme.text,
        } as CSSProperties
      }
    >
      <Header
        title={state.title}
        isRunningPhase={isRunningPhase}
        blockNum={block ? `Block ${block.n} / ${state.blocks.length}` : ''}
        mutedText={theme.muted}
        onEdit={() => dispatch({ type: 'OPEN_EDITOR' })}
        onNew={handleNewPractice}
      />

      {state.phase === 'setup' && (
        <SetupScreen
          title={state.title}
          onTitleChange={(val) => dispatch({ type: 'SET_TITLE', val })}
          blocks={state.blocks}
          onLabelChange={(idx, val) => dispatch({ type: 'SET_BLOCK_LABEL', idx, val })}
          onDurChange={(idx, val) => dispatch({ type: 'SET_BLOCK_DUR', idx, val })}
          onRemove={(idx) => dispatch({ type: 'REMOVE_BLOCK', idx })}
          onReorder={(fromIdx, toIdx) => dispatch({ type: 'REORDER_BLOCKS', fromIdx, toIdx })}
          onAddBlock={() => dispatch({ type: 'ADD_BLOCK' })}
          onStart={() => {
            unlockAudio();
            dispatch({ type: 'START_PRACTICE' });
          }}
          onImport={(blocks) => dispatch({ type: 'IMPORT_BLOCKS', blocks })}
        />
      )}

      {state.phase === 'running' && block && (
        <RunningScreen
          theme={theme}
          block={block}
          next={next}
          secs={state.secs}
          running={state.running}
          sound={state.sound}
          onToggleRun={() => {
            unlockAudio();
            dispatch({ type: 'TOGGLE_RUN' });
          }}
          onBack={() => dispatch({ type: 'BACK' })}
          onSkip={() => dispatch({ type: 'SKIP' })}
          onToggleSound={() => dispatch({ type: 'TOGGLE_SOUND' })}
        />
      )}

      {state.showEditor && (
        <EditorModal
          blocks={state.blocks}
          onLabelChange={(idx, val) => dispatch({ type: 'SET_BLOCK_LABEL', idx, val })}
          onDurChange={(idx, val) => dispatch({ type: 'SET_BLOCK_DUR', idx, val })}
          onRemove={(idx) => dispatch({ type: 'REMOVE_BLOCK', idx })}
          onReorder={(fromIdx, toIdx) => dispatch({ type: 'REORDER_BLOCKS', fromIdx, toIdx })}
          onAddBlock={() => dispatch({ type: 'ADD_BLOCK' })}
          onDone={() => dispatch({ type: 'CLOSE_EDITOR' })}
        />
      )}
    </div>
  );
}

export default App;
