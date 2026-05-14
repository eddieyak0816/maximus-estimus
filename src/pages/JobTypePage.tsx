import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import type { JobType } from '../types';

const JOB_TYPE_META: { type: JobType; icon: string; desc: string }[] = [
  { type: 'Kitchen', icon: '🍳', desc: 'Full or partial kitchen renovation' },
  { type: 'Bathroom', icon: '🚿', desc: 'Bathroom remodel, tile, vanity, fixtures' },
  { type: 'Flooring', icon: '🪵', desc: 'Hardwood, LVP, tile, carpet, or other' },
  { type: 'Living Room', icon: '🛋️', desc: 'Living room flooring, lighting, renovation' },
  { type: 'Bedroom', icon: '🛏️', desc: 'Bedroom flooring, closets, renovation' },
  { type: 'Deck', icon: '🏗️', desc: 'Deck repair, replacement, or new construction' },
  { type: 'Other', icon: '🔧', desc: 'General contracting or specialty work' },
];

const JOB_TYPE_COLORS: Record<JobType, string> = {
  Kitchen: '#1F3096',
  Bathroom: '#0d7c66',
  Flooring: '#7c5c0d',
  'Living Room': '#6b5b0a',
  Bedroom: '#5c3d6f',
  Deck: '#4a5f0d',
  Other: '#4a4a4a',
};

export default function JobTypePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAssessment, addJob, removeJob } = useAssessmentStore();

  const assessment = id ? getAssessment(id) : undefined;

  const [selectedType, setSelectedType] = useState<JobType>('Kitchen');
  const [label, setLabel] = useState('');

  if (!assessment) return <div className="page-empty">Assessment not found.</div>;

  const jobs = assessment.jobs;

  const getDefaultLabel = (type: JobType) => {
    const count = jobs.filter(j => j.type === type).length;
    return count === 0 ? type : `${type} ${count + 1}`;
  };

  const handleTypeSelect = (type: JobType) => {
    setSelectedType(type);
    setLabel(getDefaultLabel(type));
  };

  const handleAdd = () => {
    const finalLabel = label.trim() || getDefaultLabel(selectedType);
    addJob(id!, selectedType, finalLabel);
    setLabel(getDefaultLabel(selectedType));
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/assessment/${id}/client`)}>← Back</button>
        <h2 className="page-title">Jobs</h2>
      </div>

      <p className="page-hint" style={{ marginBottom: 20 }}>
        Add one job for each space being assessed. You can add multiple kitchens, bathrooms, or any combination.
      </p>

      {/* Current jobs list */}
      {jobs.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="tiny-label" style={{ marginBottom: 10 }}>Added Jobs</div>
          <div className="job-builder-list">
            {jobs.map((job, i) => (
              <div key={job.id} className="job-builder-row">
                <div className="job-builder-num">{i + 1}</div>
                <div className="job-builder-icon">{JOB_TYPE_META.find(m => m.type === job.type)?.icon}</div>
                <div className="job-builder-info">
                  <div className="job-builder-label">{job.label}</div>
                  <div className="job-builder-type" style={{ color: JOB_TYPE_COLORS[job.type] }}>{job.type}</div>
                </div>
                <button className="remove-btn" onClick={() => removeJob(id!, job.id)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add a job */}
      <div className="job-add-card">
        <div className="tiny-label" style={{ marginBottom: 12 }}>Add a Job</div>

        <div className="job-type-pills">
          {JOB_TYPE_META.map(({ type, icon }) => (
            <button
              key={type}
              className={`job-type-pill${selectedType === type ? ' active' : ''}`}
              onClick={() => handleTypeSelect(type)}
            >
              <span>{icon}</span> {type}
            </button>
          ))}
        </div>

        <div className="form-field" style={{ marginTop: 14 }}>
          <label className="form-label">Label <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — e.g. "Main Kitchen", "Upstairs Bath")</span></label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder={getDefaultLabel(selectedType)}
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={handleAdd}>
              + Add
            </button>
          </div>
        </div>
      </div>

      <div className="page-footer" style={{ marginTop: 28 }}>
        <button
          className="btn btn-primary btn-full"
          disabled={jobs.length === 0}
          onClick={() => navigate(`/assessment/${id}`)}
        >
          {jobs.length === 0 ? 'Add at least one job to continue' : `Start Assessment (${jobs.length} job${jobs.length > 1 ? 's' : ''}) →`}
        </button>
      </div>
    </div>
  );
}
