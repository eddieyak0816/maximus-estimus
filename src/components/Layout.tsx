import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { useAuth } from '../contexts/AuthContext';

function Logo() {
  const [err, setErr] = useState(false);
  if (!err) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}logo.jpg`}
        alt="Maximus Construction LLC"
        className="brand-logo"
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <span className="brand-logo-fallback">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#1F3096"/>
        <text x="16" y="22" textAnchor="middle" fontSize="13" fontWeight="900" fill="#F5C42A" fontFamily="Arial,sans-serif">MC</text>
      </svg>
      <span className="brand-name">Maximus Estimus</span>
    </span>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const syncFromCloud = useAssessmentStore(s => s.syncFromCloud);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) return;
    syncFromCloud();
  }, [syncFromCloud, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          <Logo />
          <span className="brand-sub">Field Assessment Tool</span>
        </Link>
        {user && (
          <nav className="header-nav">
            <Link to="/" className={pathname === '/' ? 'nav-link active' : 'nav-link'}>Dashboard</Link>
            <Link to="/gallery" className={pathname === '/gallery' ? 'nav-link active' : 'nav-link'}>Gallery</Link>
            <Link to="/price-guide" className={pathname === '/price-guide' ? 'nav-link active' : 'nav-link'}>Price Guide</Link>
            <Link to="/new" className="btn btn-primary btn-sm">+ New Assessment</Link>
            <button
              onClick={handleSignOut}
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              Sign Out
            </button>
          </nav>
        )}
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        © {new Date().getFullYear()} Maximus Construction NJ LLC · Field Assessment Tool
      </footer>
    </div>
  );
}
