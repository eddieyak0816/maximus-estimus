import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { useAuth } from '../contexts/AuthContext';
import { syncOnReconnect, setupRealtimeListener } from '../utils/supabaseSync';
import FontSizeControl from './FontSizeControl';

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

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={open ? 'hamburger-icon open' : 'hamburger-icon'}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const syncFromCloud = useAssessmentStore(s => s.syncFromCloud);
  const assessments = useAssessmentStore(s => s.assessments);
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Initial sync on user login
  useEffect(() => {
    if (!user) return;
    syncFromCloud();
  }, [syncFromCloud, user]);

  // Connection detection: sync when going from offline to online
  useEffect(() => {
    if (!user) return;

    const handleOnline = async () => {
      console.log('🟢 Back online — syncing with Supabase...');
      try {
        // Bidirectional sync: merge local and remote, resolve conflicts
        const merged = await syncOnReconnect(assessments);
        // Update store with merged data
        useAssessmentStore.setState({ assessments: merged });
        console.log('✅ Sync complete');
      } catch (error) {
        console.error('❌ Sync failed:', error);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user, assessments]);

  // Real-time listener: instant updates when data changes on any device
  useEffect(() => {
    if (!user) return;

    const unsubscribe = setupRealtimeListener(() => {
      console.log('📡 Real-time update — pulling fresh data');
      syncFromCloud();
    });

    return unsubscribe;
  }, [user, syncFromCloud]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
          <>
            <nav className="header-nav">
              <Link to="/" className={pathname === '/' ? 'nav-link active' : 'nav-link'}>Dashboard</Link>
              <Link to="/gallery" className={pathname === '/gallery' ? 'nav-link active' : 'nav-link'}>Gallery</Link>
              <Link to="/price-guide" className={pathname === '/price-guide' ? 'nav-link active' : 'nav-link'}>Price Guide</Link>
              <FontSizeControl />
              <Link to="/new" className="btn btn-primary btn-sm">+ New Assessment</Link>
              <button
                onClick={handleSignOut}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                Sign Out
              </button>
            </nav>

            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
              <HamburgerIcon open={menuOpen} />
            </button>

            {menuOpen && <div className="mobile-nav-overlay" onClick={() => setMenuOpen(false)} />}

            <div className={`mobile-nav-panel${menuOpen ? ' open' : ''}`}>
              <Link to="/" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/gallery" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>Gallery</Link>
              <Link to="/price-guide" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>Price Guide</Link>

              <div style={{ padding: '12px 24px' }}>
                <FontSizeControl />
              </div>

              <Link to="/new" className="btn btn-primary mobile-nav-item" style={{ margin: '16px 16px 0 16px', width: 'auto', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
                + New Assessment
              </Link>

              <div className="mobile-nav-divider" />

              <button
                onClick={() => { handleSignOut(); setMenuOpen(false); }}
                className="mobile-nav-item"
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        © {new Date().getFullYear()} Maximus Construction NJ LLC · Field Assessment Tool
      </footer>
    </div>
  );
}
