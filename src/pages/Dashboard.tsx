import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/calculations';
import { supabase } from '../lib/supabase';
import type { JobType } from '../types';

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

type SortBy = 'date-newest' | 'date-oldest' | 'name-asc' | 'name-desc';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { assessments, deleteAssessment, setStatus, statuses } = useAssessmentStore();
  const [creatorMap, setCreatorMap] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('date-newest');
  const [searchName, setSearchName] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);

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

  const totalCount = visibleAssessments.length;
  const statusCounts: Record<string, number> = {};
  for (const st of statuses) {
    statusCounts[st.value] = visibleAssessments.filter(a => a.status === st.value).length;
  }

  // Apply status filter
  if (activeFilter && activeFilter !== 'total') {
    visibleAssessments = visibleAssessments.filter(a => a.status === activeFilter);
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

  const handleStatClick = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  const toggleJobType = (jobType: JobType) => {
    setSelectedJobTypes(prev =>
      prev.includes(jobType)
        ? prev.filter(t => t !== jobType)
        : [...prev, jobType]
    );
  };

  const handleStatusChange = (assessmentId: string, newStatus: string) => {
    setStatus(assessmentId, newStatus);
    setStatusDropdownId(null);
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
          <span className="stat-value">{totalCount}</span>
          <span className="stat-label">Total</span>
        </div>
        {statuses.map(st => (
          <div
            key={st.value}
            className={`stat-card ${activeFilter === st.value ? 'stat-card-active' : ''}`}
            onClick={() => handleStatClick(st.value)}
            style={{ cursor: 'pointer', borderTop: `3px solid ${st.color}` }}
          >
            <span className="stat-value" style={{ color: st.color }}>{statusCounts[st.value] ?? 0}</span>
            <span className="stat-label">{st.label}</span>
          </div>
        ))}
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
                  style={{ background: statuses.find(s => s.value === a.status)?.color ?? '#6b7280' }} />

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
                  <div style={{ position: 'relative' }}>
                    <button
                      className="status-label"
                      onClick={e => {
                        e.stopPropagation();
                        setStatusDropdownId(statusDropdownId === a.id ? null : a.id);
                      }}
                      style={{
                        color: statuses.find(s => s.value === a.status)?.color ?? '#6b7280',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {statuses.find(s => s.value === a.status)?.label ?? a.status} ▼
                    </button>

                    {statusDropdownId === a.id && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '4px',
                          background: 'rgba(13, 18, 45, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                          zIndex: 1000,
                          minWidth: '150px',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        {statuses.map(st => (
                          <button
                            key={st.value}
                            onClick={e => {
                              e.stopPropagation();
                              handleStatusChange(a.id, st.value);
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '10px 12px',
                              textAlign: 'left',
                              border: 'none',
                              background: a.status === st.value ? `rgba(${parseInt(st.color.slice(1, 3), 16)}, ${parseInt(st.color.slice(3, 5), 16)}, ${parseInt(st.color.slice(5, 7), 16)}, 0.2)` : 'transparent',
                              color: a.status === st.value ? st.color : 'rgba(255, 255, 255, 0.8)',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: a.status === st.value ? '600' : '400',
                              transition: 'all 0.15s',
                              borderLeft: a.status === st.value ? `3px solid ${st.color}` : '3px solid transparent',
                            }}
                            onMouseEnter={e => {
                              if (a.status !== st.value) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (a.status !== st.value) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            {a.status === st.value ? '✓ ' : ''}{st.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

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
