import teamLogo from '../assets/team-logo.png';

interface Props {
  title: string;
  isRunningPhase: boolean;
  blockNum: string;
  mutedText: string;
  onEdit: () => void;
  onNew: () => void;
}

export function Header({ title, isRunningPhase, blockNum, mutedText, onEdit, onNew }: Props) {
  return (
    <div className="header-row">
      <div className="header-left">
        <img src={teamLogo} alt="Team logo" className="team-logo" />
        <div className="header-title">{title}</div>
      </div>
      {isRunningPhase && (
        <div className="header-right">
          <div className="block-num">{blockNum}</div>
          <button type="button" className="chip-btn" style={{ color: mutedText, borderColor: mutedText }} onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="chip-btn" style={{ color: mutedText, borderColor: mutedText }} onClick={onNew}>
            New
          </button>
        </div>
      )}
    </div>
  );
}
