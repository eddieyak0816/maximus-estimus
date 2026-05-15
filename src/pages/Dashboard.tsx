import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/calculations';
import { supabase } from '../lib/supabase';
import type { JobType, AssessmentStatus } from '../types';

const JOB_TYPE_COLORS: Record<JobType, string> = {
  Kitchen: '#1F3096',
  Bathroom: '#0d7c66',
  Flooring: '#7c5c0d',
  'Living Room': '#8b5a2b',
  Bedroom: '#a9742e',
  Deck: '#6b8e23',
  Other: '#4a4a4a',
};

const STATUS_DOTS: Record<AssessmentStatus, string> = {
  draft: '#6b7280',
  'in-progress': '#3b82f6',
  complete: '#22c55e',
};

const STATUS_LABELS: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  'in-progress': 'In Progress',
  complete: 'Complete',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { assessments, deleteAssessment } = useAssessmentStore();
  const [creatorMap, setCreatorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadCreators() {
      console.log('Loading creator names from Supabase...');
      const { data, error } = await supabase
        .from('pin_users')
        .select('id,first_name,last_name');
      console.log('Creator fetch result:', { data, error });
      if (!error && data) {
        const map: Record<string, string> = {};
        data.forEach(u => {
          map[u.id] = `${u.first_name} ${u.last_name}`.trim();
        });
        console.log('Creator map built:', map);
        setCreatorMap(map);
      } else {
        console.error('Failed to load creators:', error);
      }
    }
    loadCreators();
  }, []);

  function handleDelete(id: string, name: string) {
    if (confirm(`Delete "${name || 'Untitled'}"? This cannot be undone.`)) {
      deleteAssessment(id);
    }
  }

  // Filter assessments: admins see all, regular users see only their own
  const visibleAssessments = user?.isAdmin
    ? assessments
    : assessments.filter(a => a.creatorId === user?.id);

  const counts = {
    total: visibleAssessments.length,
    draft: visibleAssessments.filter(a => a.status === 'draft').length,
    inProgress: visibleAssessments.filter(a => a.status === 'in-progress').length,
    complete: visibleAssessments.filter(a => a.status === 'complete').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Field Assessments</h1>
          <p className="page-subtitle">Maximus Construction NJ LLC</p>
          {user && <p className="page-subtitle" style={{ fontSize: '0.875rem', marginTop: '4px', opacity: 0.8 }}>👤 {user.firstName} {user.lastName}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/new')}>+ New</button>
      </div>

      <div className="dashboard-quicklinks">
        <Link to="/gallery" className="btn btn-ghost btn-sm">🖼️ Cabinet Gallery</Link>
        <Link to="/price-guide" className="btn btn-ghost btn-sm">💰 Price Guide</Link>
        {user?.isAdmin && <Link to="/admin/users" className="btn btn-ghost btn-sm">👥 Admin Users</Link>}
        {user?.isAdmin && <Link to="/admin/dropdowns" className="btn btn-ghost btn-sm">🔧 Manage Dropdowns</Link>}
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{counts.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.draft}</span>
          <span className="stat-label">Drafts</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.inProgress}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.complete}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      {visibleAssessments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No assessments yet</h2>
          <p>Start your first field assessment.</p>
          <button className="btn btn-primary" onClick={() => navigate('/new')}>+ New Assessment</button>
        </div>
      ) : (
        <div className="assessment-list">
          {visibleAssessments.map(a => {
            const name = [a.client.firstName, a.client.lastName].filter(Boolean).join(' ') || 'Untitled';
            const href = `/assessment/${a.id}`;

            return (
              <div
                key={a.id}
                className="assessment-card"
                onClick={() => navigate(href)}
              >
                <div className="assessment-card-status-dot"
                  style={{ background: STATUS_DOTS[a.status] }} />

                <div className="assessment-card-left">
                  <div className="assessment-card-name">{name}</div>
                  {a.client.address && (
                    <div className="assessment-card-addr">{a.client.address}</div>
                  )}
                  <div className="assessment-card-meta">
                    <div className="job-type-tags">
                      {a.jobs.map(j => (
                        <span key={j.id} className="job-type-tag"
                          style={{ background: JOB_TYPE_COLORS[j.type] }}>
                          {j.label}
                        </span>
                      ))}
                    </div>
                    {a.jobs.length > 0 && <span className="meta-sep">·</span>}
                    {a.creatorId && user?.isAdmin && creatorMap[a.creatorId] && (
                      <>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>👤 {creatorMap[a.creatorId]}</span>
                        <span className="meta-sep">·</span>
                      </>
                    )}
                    <span>{formatDate(a.updatedAt)}</span>
                  </div>
                </div>

                <div className="assessment-card-right">
                  <span className="status-label"
                    style={{ color: STATUS_DOTS[a.status] }}>
                    {STATUS_LABELS[a.status]}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm btn-danger"
                    onClick={e => { e.stopPropagation(); handleDelete(a.id, name); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
