import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { MessageTemplate } from '../types';
import { v4 as uuidv4 } from 'uuid';

export default function AdminMessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  // Check admin access
  if (!user?.isAdmin) {
    return (
      <div className="page">
        <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
          Access denied. Admin only.
        </div>
      </div>
    );
  }

  // Load templates from Supabase
  useEffect(() => {
    async function loadTemplates() {
      try {
        const { data, error } = await supabase
          .from('message_templates')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const mapped: MessageTemplate[] = (data || []).map(t => ({
          id: t.id,
          name: t.name,
          content: t.content,
          createdBy: t.created_by,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }));

        setTemplates(mapped);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  const handleAddTemplate = async () => {
    if (!newName.trim() || !newContent.trim()) return;

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('message_templates')
        .insert([{
          id: uuidv4(),
          name: newName.trim(),
          content: newContent.trim(),
          created_by: user.id,
          created_at: now,
          updated_at: now,
        }])
        .select()
        .single();

      if (error) throw error;

      setTemplates([
        {
          id: data.id,
          name: data.name,
          content: data.content,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        ...templates,
      ]);

      setNewName('');
      setNewContent('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add template:', err);
      alert('Failed to add template');
    }
  };

  const handleUpdateTemplate = async (id: string) => {
    if (!editName.trim() || !editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .update({
          name: editName.trim(),
          content: editContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setTemplates(templates.map(t =>
        t.id === id
          ? {
              ...t,
              name: editName.trim(),
              content: editContent.trim(),
              updatedAt: new Date().toISOString(),
            }
          : t
      ));

      setEditingId(null);
    } catch (err) {
      console.error('Failed to update template:', err);
      alert('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete template:', err);
      alert('Failed to delete template');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Message Templates</h1>
          <p className="page-subtitle">Global templates for communication log</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/admin')}
        >
          ← Back to Admin
        </button>
      </div>

      {/* Add Template Form */}
      {showAddForm ? (
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '12px' }}>
            ➕ New Template
          </div>

          <input
            type="text"
            placeholder="Template name (e.g., 'Follow-up scheduled')"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'inherit',
              fontSize: '13px',
              marginBottom: '10px',
            }}
          />

          <textarea
            placeholder="Template content..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'inherit',
              fontSize: '13px',
              marginBottom: '10px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handleAddTemplate}>
              Create
            </button>
            <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          style={{ marginBottom: '24px' }}
        >
          ➕ New Template
        </button>
      )}

      {/* Templates List */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: '24px' }}>
          No templates yet. Create one above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {templates.map(template => (
            <div
              key={template.id}
              style={{
                padding: '16px',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '4px',
              }}
            >
              {editingId === template.id ? (
                <div>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: 'inherit',
                      fontSize: '13px',
                      marginBottom: '10px',
                    }}
                  />

                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: 'inherit',
                      fontSize: '13px',
                      marginBottom: '10px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleUpdateTemplate(template.id)}
                    >
                      Save
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                    {template.name}
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      marginBottom: '12px',
                    }}
                  >
                    {template.content}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                      Updated: {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditingId(template.id);
                          setEditName(template.name);
                          setEditContent(template.content);
                        }}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-danger"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
