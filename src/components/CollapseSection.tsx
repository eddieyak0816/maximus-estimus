import { useState } from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: boolean;
}

export default function CollapseSection({ title, children, defaultOpen = true, accent = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapse-section">
      <button
        className={`collapse-header${accent ? ' collapse-header-accent' : ''}${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span className="collapse-title">{title}</span>
        <svg className={`collapse-chevron${open ? ' open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open && <div className="collapse-body">{children}</div>}
    </div>
  );
}
