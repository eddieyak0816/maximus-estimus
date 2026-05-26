import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import DropdownSelect from '../components/DropdownSelect';
import type { ClientInfo } from '../types';

export default function CustomerInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAssessment, updateAssessment, deleteAssessment } = useAssessmentStore();
  const [hasClientName, setHasClientName] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);

  const assessment = id ? getAssessment(id) : undefined;

  // Load users for assignment dropdown (admin only)
  useEffect(() => {
    if (!user?.isAdmin) return;
    async function loadUsers() {
      const { data, error } = await supabase
        .from('pin_users')
        .select('id,first_name,last_name');
      if (!error && data) {
        setUsers(data.map(u => ({ id: u.id, firstName: u.first_name, lastName: u.last_name })));
      }
    }
    loadUsers();
  }, [user?.isAdmin]);

  // If user navigates away without filling in a client name, delete the blank assessment
  useEffect(() => {
    return () => {
      if (id && !hasClientName) {
        const a = getAssessment(id);
        if (a && !a.client.firstName?.trim() && !a.client.lastName?.trim()) {
          deleteAssessment(id);
        }
      }
    };
  }, [id, hasClientName, getAssessment, deleteAssessment]);

  if (!assessment) return <div className="page-empty">Assessment not found.</div>;

  const client = assessment.client;
  const u = (f: keyof ClientInfo, v: string) => {
    updateAssessment(id!, { client: { ...client, [f]: v } });
    // Mark as having client name once user fills in firstName or lastName
    if ((f === 'firstName' || f === 'lastName') && v.trim()) {
      setHasClientName(true);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back</button>
        <h2 className="page-title">Customer Info</h2>
      </div>

      <div className="form-section">
        <div className="grid-2">
          <div className="form-field">
            <label className="form-label">First Name</label>
            <input className="input" placeholder="First name"
              value={client.firstName} onChange={e => u('firstName', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Last Name</label>
            <input className="input" placeholder="Last name"
              value={client.lastName} onChange={e => u('lastName', e.target.value)} />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Address</label>
          <input className="input" placeholder="Job site address"
            value={client.address} onChange={e => u('address', e.target.value)} />
        </div>

        <div className="grid-2">
          <div className="form-field">
            <label className="form-label">Phone</label>
            <input className="input" type="tel" placeholder="(555) 000-0000"
              value={client.phone} onChange={e => u('phone', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="email@example.com"
              value={client.email} onChange={e => u('email', e.target.value)} />
          </div>
        </div>

        {/* Team member */}
        <div className="form-field">
          <label className="form-label">Team Member</label>
          <DropdownSelect
            listName="team_members"
            value={client.teamMember}
            onChange={v => u('teamMember', v)}
            placeholder="Who is visiting?"
            allowCustom={true}
          />
        </div>

        {/* Assign to team member (admin only) */}
        {user?.isAdmin && (
          <div className="form-field">
            <label className="form-label">Assign to Team Member</label>
            <select
              className="input"
              value={assessment.assignedToUserId || ''}
              onChange={e => updateAssessment(id!, { assignedToUserId: e.target.value || undefined })}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-field">
          <label className="form-label">Visit Date</label>
          <input className="input" type="date"
            value={client.visitDate} onChange={e => u('visitDate', e.target.value)} />
        </div>

        <div className="form-field">
          <label className="form-label">Notes</label>
          <textarea className="textarea" rows={3} placeholder="Anything to note about this client or location…"
            value={client.notes} onChange={e => u('notes', e.target.value)} />
        </div>
      </div>

      <div className="page-footer">
        <button className="btn btn-primary btn-full" onClick={() => navigate(`/assessment/${id}/type`)}>
          Next — Jobs →
        </button>
      </div>
    </div>
  );
}
