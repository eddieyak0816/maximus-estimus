import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import type { ClientInfo } from '../types';

export default function CustomerInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAssessment, updateAssessment, teamMembers, addTeamMember, removeTeamMember } = useAssessmentStore();

  const assessment = id ? getAssessment(id) : undefined;
  const [managingTeam, setManagingTeam] = useState(false);
  const [newMemberInput, setNewMemberInput] = useState('');

  if (!assessment) return <div className="page-empty">Assessment not found.</div>;

  const client = assessment.client;
  const u = (f: keyof ClientInfo, v: string) =>
    updateAssessment(id!, { client: { ...client, [f]: v } });

  const memberInList = teamMembers.includes(client.teamMember);
  const isOther = client.teamMember !== '' && !memberInList;

  const handleAddMember = () => {
    const name = newMemberInput.trim();
    if (!name) return;
    addTeamMember(name);
    setNewMemberInput('');
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="form-label" style={{ margin: 0 }}>Team Member</label>
            <button className="btn btn-ghost btn-sm" style={{ padding: '3px 8px', fontSize: 12 }}
              onClick={() => setManagingTeam(m => !m)}>
              {managingTeam ? 'Done' : '⚙ Manage Members'}
            </button>
          </div>

          {managingTeam && (
            <div className="team-manage-box">
              <div className="team-manage-list">
                {teamMembers.length === 0
                  ? <div className="team-manage-empty">No members added yet.</div>
                  : teamMembers.map(m => (
                    <div key={m} className="team-manage-row">
                      <span>{m}</span>
                      <button className="remove-btn" onClick={() => removeTeamMember(m)}>×</button>
                    </div>
                  ))
                }
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input className="input" placeholder="Add team member name…"
                  value={newMemberInput}
                  onChange={e => setNewMemberInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddMember()} />
                <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={handleAddMember}>Add</button>
              </div>
            </div>
          )}

          {teamMembers.length > 0 ? (
            <>
              <select className="select" value={memberInList ? client.teamMember : (isOther ? '__other__' : '')}
                onChange={e => {
                  if (e.target.value === '__other__') { u('teamMember', ''); }
                  else { u('teamMember', e.target.value); }
                }}>
                <option value="">— Select team member —</option>
                {teamMembers.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="__other__">Other…</option>
              </select>
              {(isOther || (!memberInList && !client.teamMember)) && (
                <input className="input" style={{ marginTop: 6 }} placeholder="Enter name…"
                  value={client.teamMember} onChange={e => u('teamMember', e.target.value)} />
              )}
            </>
          ) : (
            <input className="input" placeholder="Who is visiting?"
              value={client.teamMember} onChange={e => u('teamMember', e.target.value)} />
          )}
        </div>

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
