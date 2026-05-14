interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export default function SectionCard({ title, subtitle, children, action }: Props) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <div>
          <h2 className="section-card-title">{title}</h2>
          {subtitle && <p className="section-card-subtitle">{subtitle}</p>}
        </div>
        {action && <div className="section-card-action">{action}</div>}
      </div>
      <div className="section-card-body">{children}</div>
    </div>
  );
}
