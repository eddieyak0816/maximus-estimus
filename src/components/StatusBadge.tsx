import { useAssessmentStore } from '../store/assessmentStore';

export default function StatusBadge({ status }: { status: string }) {
  const { statuses } = useAssessmentStore();
  const config = statuses.find(s => s.value === status);
  const label = config?.label ?? status;
  const color = config?.color ?? '#6b7280';

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 999,
      fontSize: '0.75rem',
      fontWeight: 600,
      background: color + '22',
      color,
      border: `1px solid ${color}55`,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  );
}
