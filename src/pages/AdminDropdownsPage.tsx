import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getDropdownListsForAdmin,
  fetchDropdownList,
  addDropdownOption,
  removeDropdownOption,
} from '../utils/dropdownManager';
import type { DropdownList, DropdownOption } from '../utils/dropdownManager';

export default function AdminDropdownsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState<DropdownList[]>([]);
  const [selectedList, setSelectedList] = useState<DropdownList | null>(null);
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [newOptionValue, setNewOptionValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Load dropdown lists
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const dropdownLists = await getDropdownListsForAdmin();
        setLists(dropdownLists);
        if (dropdownLists.length > 0) {
          setSelectedList(dropdownLists[0]);
        }
      } catch (err) {
        setError('Failed to load dropdown lists');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load options for selected list
  useEffect(() => {
    if (selectedList) {
      (async () => {
        try {
          const opts = await fetchDropdownList(selectedList.name);
          setOptions(opts);
        } catch (err) {
          setError('Failed to load options');
          console.error(err);
        }
      })();
    }
  }, [selectedList]);

  const handleAddOption = async () => {
    if (!newOptionValue.trim() || !selectedList) return;

    try {
      setSaving(true);
      await addDropdownOption(selectedList.name, newOptionValue.trim(), newOptionValue.trim());

      // Reload options
      const opts = await fetchDropdownList(selectedList.name);
      setOptions(opts);
      setNewOptionValue('');
      setSuccessMessage(`Added "${newOptionValue}" to ${selectedList.label}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to add option');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveOption = async (optionId: string, optionValue: string) => {
    if (!confirm(`Remove "${optionValue}"?`)) return;

    try {
      setSaving(true);
      await removeDropdownOption(optionId);
      setOptions(options.filter(o => o.id !== optionId));
      setSuccessMessage(`Removed "${optionValue}"`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to remove option');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="assess-tab" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', fontSize: 'var(--font-size-xl)' }}>
        🔧 Manage Dropdowns
      </h2>

      {error && (
        <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#ff4444', color: 'white', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#44cc44', color: 'white', borderRadius: '4px' }}>
          ✓ {successMessage}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px' }}>
          {/* Sidebar: List of dropdown categories */}
          <div style={{ borderRight: '1px solid #444', paddingRight: '16px' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', marginBottom: '12px' }}>
              Categories
            </h3>
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => setSelectedList(list)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  marginBottom: '8px',
                  textAlign: 'left',
                  backgroundColor: selectedList?.id === list.id ? '#333' : '#222',
                  border: '1px solid #555',
                  color: '#fff',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {list.label}
              </button>
            ))}
          </div>

          {/* Main: Options for selected list */}
          <div>
            {selectedList ? (
              <>
                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '16px' }}>
                  {selectedList.label}
                </h3>
                {selectedList.description && (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: '#aaa', marginBottom: '16px' }}>
                    {selectedList.description}
                  </p>
                )}

                {/* Add new option */}
                <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newOptionValue}
                    onChange={e => setNewOptionValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddOption()}
                    placeholder="New option..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#222',
                      border: '1px solid #555',
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  />
                  <button
                    onClick={handleAddOption}
                    disabled={saving || !newOptionValue.trim()}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: newOptionValue.trim() ? '#F5C42A' : '#666',
                      border: 'none',
                      color: '#000',
                      borderRadius: '4px',
                      cursor: newOptionValue.trim() ? 'pointer' : 'not-allowed',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'bold',
                    }}
                  >
                    {saving ? 'Adding...' : 'Add'}
                  </button>
                </div>

                {/* List of options */}
                <div style={{ backgroundColor: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
                  {options.length === 0 ? (
                    <p style={{ padding: '16px', fontSize: 'var(--font-size-sm)', color: '#999' }}>
                      No options yet.
                    </p>
                  ) : (
                    <div>
                      {options.map((opt, index) => (
                        <div
                          key={opt.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderBottom: index < options.length - 1 ? '1px solid #333' : 'none',
                            fontSize: 'var(--font-size-sm)',
                          }}
                        >
                          <span>{opt.label}</span>
                          <button
                            onClick={() => handleRemoveOption(opt.id, opt.label)}
                            disabled={saving}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#cc4444',
                              border: 'none',
                              color: '#fff',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: 'var(--font-size-xs)',
                            }}
                          >
                            ✕ Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p style={{ fontSize: 'var(--font-size-sm)', color: '#999' }}>
                Select a category to manage options.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
