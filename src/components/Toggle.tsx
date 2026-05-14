interface Props { on: boolean; onToggle: () => void; }

export default function Toggle({ on, onToggle }: Props) {
  return (
    <div className={`toggle${on ? ' toggle-on' : ''}`} onClick={onToggle} role="switch" aria-checked={on}>
      <div className="toggle-thumb" />
    </div>
  );
}
