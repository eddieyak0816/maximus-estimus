import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { PinUser } from '../contexts/AuthContext';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<PinUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) return;
    loadUsers();
  }, [user?.isAdmin]);

  async function loadUsers() {
    try {
      const { data, error: err } = await supabase
        .from('pin_users')
        .select('id,first_name,last_name,email,pin,is_admin,created_at')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const pinUsers: PinUser[] = (data || []).map(row => ({
        id: row.id,
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        email: row.email || '',
        pin: row.pin,
        isAdmin: row.is_admin || false,
        createdAt: row.created_at,
      }));

      setUsers(pinUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;

    try {
      const { error: err } = await supabase
        .from('pin_users')
        .delete()
        .eq('id', userId);

      if (err) throw err;

      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  }

  if (!user?.isAdmin) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>Only super admins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin: Users</h1>
          <p className="page-subtitle">Manage all PIN users in the system</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#7f1d1d', color: '#fca5a5', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h2>No users</h2>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>PIN</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Admin</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{u.firstName} {u.lastName}</td>
                  <td style={{ padding: '12px' }}>{u.email}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>{u.pin}</td>
                  <td style={{ padding: '12px' }}>
                    {u.isAdmin ? <span style={{ color: 'var(--accent)' }}>✓ Yes</span> : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      className="btn btn-ghost btn-sm btn-danger"
                      onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
