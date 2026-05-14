interface Props {
  label: string;
  selected: boolean;
  onToggle: () => void;
  round?: boolean;
}

export default function CheckOpt({ label, selected, onToggle, round = false }: Props) {
  return (
    <div className={`check-opt${selected ? ' selected' : ''}`} onClick={onToggle}>
      <div className={`check-opt-box${round ? ' round' : ''}${selected ? ' selected' : ''}`}>
        {selected && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </div>
      <span className="check-opt-label">{label}</span>
    </div>
  );
}
