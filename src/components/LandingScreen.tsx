import teamLogo from '../assets/team-logo.png';

interface Props {
  onEnter: () => void;
}

export function LandingScreen({ onEnter }: Props) {
  return (
    <div className="landing-screen">
      <img src={teamLogo} alt="Team logo" className="landing-logo" />
      <button type="button" className="btn btn-solid landing-button" onClick={onEnter}>
        Get Started
      </button>
    </div>
  );
}
