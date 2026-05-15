interface Props {
  open: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function ChevronIcon({ open, onClick }: Props) {
  return (
    <button
      className={`icon-btn chevron-icon${open ? ' open' : ''}`}
      onClick={onClick}
      style={{ padding: '4px 6px', minWidth: 'auto' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </button>
  );
}
