import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAssessmentStore } from '../store/assessmentStore';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { assessments } = useAssessmentStore();

  if (!user?.isAdmin) {
    return (
      <div className="page">
        <div className="empty-state" style={{ marginTop: 80 }}>
          <div className="empty-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  const teamSize = new Set(assessments.map(a => a.creatorId)).size;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage team, dropdowns, pricing, and more</p>
        </div>
      </div>

      {/* App Stats Row */}
      <div className="stats-row" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value">{assessments.length}</div>
          <div className="stat-label">Total Assessments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{teamSize}</div>
          <div className="stat-label">Team Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user.firstName} {user.lastName}</div>
          <div className="stat-label">Logged In</div>
        </div>
      </div>

      {/* Admin Section Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
        {/* Users Management */}
        <Link to="/admin/users" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="section-card" style={{ cursor: 'pointer', transition: 'transform 0.15s', height: '100%' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="section-card-header">
              <div>
                <div className="section-card-title">👥 Manage Users</div>
                <div className="section-card-subtitle">Team PINs & Permissions</div>
              </div>
              <span style={{ fontSize: 24 }}>→</span>
            </div>
            <div className="section-card-body" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Create, edit, and delete team member accounts with admin permissions.
            </div>
          </div>
        </Link>

        {/* Dropdowns Management */}
        <Link to="/admin/dropdowns" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="section-card" style={{ cursor: 'pointer', transition: 'transform 0.15s', height: '100%' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="section-card-header">
              <div>
                <div className="section-card-title">🔧 Dropdown Lists</div>
                <div className="section-card-subtitle">Configure Options</div>
              </div>
              <span style={{ fontSize: 24 }}>→</span>
            </div>
            <div className="section-card-body" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Manage options for appliances, materials, finishes, and custom fields.
            </div>
          </div>
        </Link>

        {/* Price Guide */}
        <Link to="/price-guide" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="section-card" style={{ cursor: 'pointer', transition: 'transform 0.15s', height: '100%' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="section-card-header">
              <div>
                <div className="section-card-title">💰 Price Guide</div>
                <div className="section-card-subtitle">Rates & Categories</div>
              </div>
              <span style={{ fontSize: 24 }}>→</span>
            </div>
            <div className="section-card-body" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Edit material costs, labor rates, markups, and price categories.
            </div>
          </div>
        </Link>

        {/* Message Templates */}
        <Link to="/admin/messages" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="section-card" style={{ cursor: 'pointer', transition: 'transform 0.15s', height: '100%' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="section-card-header">
              <div>
                <div className="section-card-title">📋 Message Templates</div>
                <div className="section-card-subtitle">Prefill Communication Log</div>
              </div>
              <span style={{ fontSize: 24 }}>→</span>
            </div>
            <div className="section-card-body" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Create and manage premade messages for team members to use in customer communication logs.
            </div>
          </div>
        </Link>

        {/* Job Statuses */}
        <Link to="/admin/statuses" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="section-card" style={{ cursor: 'pointer', transition: 'transform 0.15s', height: '100%' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="section-card-header">
              <div>
                <div className="section-card-title">🏷️ Job Statuses</div>
                <div className="section-card-subtitle">Draft, Active & Custom</div>
              </div>
              <span style={{ fontSize: 24 }}>→</span>
            </div>
            <div className="section-card-body" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Add, rename, recolor, or delete status types shown on assessments and the dashboard.
            </div>
          </div>
        </Link>

        {/* Cabinet Gallery */}
        <Link to="/gallery" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="section-card" style={{ cursor: 'pointer', transition: 'transform 0.15s', height: '100%' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="section-card-header">
              <div>
                <div className="section-card-title">🖼️ Cabinet Gallery</div>
                <div className="section-card-subtitle">Style References</div>
              </div>
              <span style={{ fontSize: 24 }}>→</span>
            </div>
            <div className="section-card-body" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              View and share cabinet styles, finishes, and design inspiration.
            </div>
          </div>
        </Link>
      </div>

      {/* Help text */}
      <div style={{ padding: '16px 18px', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', fontSize: 13 }}>
        💡 More admin features coming in Sprint 4: manage job types, team member settings, and gallery image uploads.
      </div>
    </div>
  );
}
