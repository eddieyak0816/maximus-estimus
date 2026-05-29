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
  Painting: '#c85a54',
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

type SortBy = 'date-newest' | 'date-oldest' | 'name-asc' | 'name-desc';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { assessments, deleteAssessment } = useAssessmentStore();
  const [creatorMap, setCreatorMap] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<'total' | 'draft' | 'inProgress' | 'complete' | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('date-newest');
  const [searchName, setSearchName] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);

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

  // Filter assessments: admins see all, regular users see their own + assigned
  let visibleAssessments = user?.isAdmin
    ? assessments
    : assessments.filter(a =>
        a.creatorId === user?.id ||
        a.assignedToUserId === user?.id
      );

  const counts = {
    total: visibleAssessments.length,
    draft: visibleAssessments.filter(a => a.status === 'draft').length,
    inProgress: visibleAssessments.filter(a => a.status === 'in-progress').length,
    complete: visibleAssessments.filter(a => a.status === 'complete').length,
  };

  // Apply status filter
  if (activeFilter === 'draft') {
    visibleAssessments = visibleAssessments.filter(a => a.status === 'draft');
  } else if (activeFilter === 'inProgress') {
    visibleAssessments = visibleAssessments.filter(a => a.status === 'in-progress');
  } else if (activeFilter === 'complete') {
    visibleAssessments = visibleAssessments.filter(a => a.status === 'complete');
  }

  // Apply search filter (customer name)
  if (searchName.trim()) {
    const query = searchName.toLowerCase();
    visibleAssessments = visibleAssessments.filter(a => {
      const name = `${a.client.firstName} ${a.client.lastName}`.toLowerCase();
      return name.includes(query);
    });
  }

  // Apply job type filter
  if (selectedJobTypes.length > 0) {
    visibleAssessments = visibleAssessments.filter(a =>
      a.jobs.some(j => selectedJobTypes.includes(j.type))
    );
  }

  // Apply sorting
  const sorted = [...visibleAssessments].sort((a, b) => {
    if (sortBy === 'date-newest') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === 'date-oldest') {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    } else if (sortBy === 'name-asc') {
      const aName = `${a.client.firstName} ${a.client.lastName}`;
      const bName = `${b.client.firstName} ${b.client.lastName}`;
      return aName.localeCompare(bName);
    } else if (sortBy === 'name-desc') {
      const aName = `${a.client.firstName} ${a.client.lastName}`;
      const bName = `${b.client.firstName} ${b.client.lastName}`;
      return bName.localeCompare(aName);
    }
    return 0;
  });

  const allJobTypes: JobType[] = ['Kitchen', 'Bathroom', 'Flooring', 'Painting', 'Living Room', 'Bedroom', 'Deck', 'Other'];

  const handleStatClick = (filter: 'total' | 'draft' | 'inProgress' | 'complete') => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
  };

  const toggleJobType = (jobType: JobType) => {
    setSelectedJobTypes(prev =>
      prev.includes(jobType)
        ? prev.filter(t => t !== jobType)
        : [...prev, jobType]
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {user?.isAdmin ? 'All Assessments' : 'My Assessments & Assigned Work'}
          </h1>
          <p className="page-subtitle">Maximus Construction NJ LLC</p>
          {user && <p className="page-subtitle" style={{ fontSize: '0.875rem', marginTop: '4px', opacity: 0.8 }}>👤 {user.firstName} {user.lastName}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/new')}>+ New</button>
      </div>

      <div className="dashboard-quicklinks">
        <Link to="/gallery" className="btn btn-ghost btn-sm">🖼️ Cabinet Gallery</Link>
        <Link to="/price-guide" className="btn btn-ghost btn-sm">💰 Price Guide</Link>
        {user?.isAdmin && <Link to="/admin" className="btn btn-ghost btn-sm">🛠️ Admin Panel</Link>}
      </div>

      <div className="stats-row">
        <div
          className={`stat-card ${activeFilter === 'total' ? 'stat-card-active' : ''}`}
          onClick={() => handleStatClick('total')}
          style={{ cursor: 'pointer' }}
        >
          <span className="stat-value">{counts.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div
          className={`stat-card ${activeFilter === 'draft' ? 'stat-card-active' : ''}`}
          onClick={() => handleStatClick('draft')}
          style={{ cursor: 'pointer' }}
        >
          <span className="stat-value">{counts.draft}</span>
          <span className="stat-label">Drafts</span>
        </div>
        <div
          className={`stat-card ${activeFilter === 'inProgress' ? 'stat-card-active' : ''}`}
          onClick={() => handleStatClick('inProgress')}
          style={{ cursor: 'pointer' }}
        >
          <span className="stat-value">{counts.inProgress}</span>
          <span className="stat-label">Active</span>
        </div>
        <div
          className={`stat-card ${activeFilter === 'complete' ? 'stat-card-active' : ''}`}
          onClick={() => handleStatClick('complete')}
          style={{ cursor: 'pointer' }}
        >
          <span className="stat-value">{counts.complete}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      {/* ── Sorting & Filtering Controls ── */}
      <div className="dashboard-controls">
        <div className="control-group">
          <input
            type="text"
            placeholder="🔍 Search by customer name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="input input-md"
            style={{ maxWidth: '300px' }}
          />
        </div>

        <div className="control-group">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            className="input input-md"
            style={{ minWidth: '160px' }}
          >
            <option value="date-newest">📅 Newest First</option>
            <option value="date-oldest">📅 Oldest First</option>
            <option value="name-asc">A-Z Customer Name</option>
            <option value="name-desc">Z-A Customer Name</option>
          </select>
        </div>

        <div className="control-group">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="tiny-label" style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>Filter by Job Type:</span>
            {allJobTypes.map(jobType => (
              <button
                key={jobType}
                className={`pill${selectedJobTypes.includes(jobType) ? ' active' : ''}`}
                onClick={() => toggleJobType(jobType)}
                style={{ fontSize: '0.875rem' }}
              >
                {selectedJobTypes.includes(jobType) ? '✓ ' : ''}{jobType}
              </button>
            ))}
            {selectedJobTypes.length > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedJobTypes([])}
                style={{ fontSize: '0.75rem' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No assessments yet</h2>
          <p>Start your first field assessment.</p>
          <button className="btn btn-primary" onClick={() => navigate('/new')}>+ New Assessment</button>
        </div>
      ) : (
        <div className="assessment-list">
          {sorted.map(a => {
            const name = [a.client.firstName, a.client.lastName].filter(Boolean).join(' ') || 'Untitled';
            const href = `/assessment/${a.id}`;
            const showCreator = a.creatorId && user?.isAdmin && creatorMap[a.creatorId];
            if (a.creatorId) {
              console.log(`Assessment "${name}": creatorId=${a.creatorId}, isAdmin=${user?.isAdmin}, creatorName=${creatorMap[a.creatorId]}, showCreator=${!!showCreator}`);
            }

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
                    {a.creatorId && (
                      <>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          👤 {creatorMap[a.creatorId] || a.creatorId.substring(0, 8)}
                          {a.assignedToUserId && a.assignedToUserId !== a.creatorId && (
                            <> → {creatorMap[a.assignedToUserId] || a.assignedToUserId.substring(0, 8)}</>
                          )}
                        </span>
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
