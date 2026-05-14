import type { AssessmentStatus } from '../types';

const labels: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  'in-progress': 'In Progress',
  complete: 'Complete',
};

export default function StatusBadge({ status }: { status: AssessmentStatus }) {
  return <span className={`badge badge-${status}`}>{labels[status]}</span>;
}
