import { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export default function AISettingsModal({ isOpen, onClose, onSave }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved API key from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('claude-api-key');
    if (saved) {
      setApiKey(saved);
    }
  }, [isOpen]);

  function handleSave() {
    if (apiKey.trim()) {
      localStorage.setItem('claude-api-key', apiKey);
      onSave(apiKey);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    }
  }

  function handleClear() {
    setApiKey('');
    localStorage.removeItem('claude-api-key');
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>AI Parsing Settings</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', fontSize: '13px', lineHeight: '1.5' }}>
            💡 <strong>Claude API Key for Transcript Parsing</strong><br/>
            To automatically parse your voice dictations and extract measurements, provide your Claude API key. It will be stored locally in your browser only.
          </div>

          <div>
            <div className="tiny-label" style={{ marginBottom: '6px' }}>Claude API Key</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: 'inherit',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                }}
              />
              <button
                className="btn btn-ghost"
                onClick={() => setShowKey(!showKey)}
                style={{ padding: '6px 10px', fontSize: '12px' }}
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.5' }}>
            <strong>Get your API key:</strong><br/>
            1. Visit <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>console.anthropic.com</a><br/>
            2. Create an account or sign in<br/>
            3. Go to API Keys → Create Key<br/>
            4. Copy and paste it here
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!apiKey.trim()}
              style={{ flex: 1 }}
            >
              {saved ? '✓ Saved!' : '💾 Save Key'}
            </button>
            {apiKey && (
              <button
                className="btn btn-ghost"
                onClick={handleClear}
                style={{ flex: 1 }}
              >
                🗑 Clear
              </button>
            )}
          </div>

          <div style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            🔒 Your API key is stored only in your browser's local storage. Never shared with us or stored on servers.
          </div>
        </div>
      </div>
    </div>
  );
}
