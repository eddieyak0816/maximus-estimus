import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type PinMode = 'unlock' | 'create';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'del'];

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<PinMode>('unlock');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, createPin } = useAuth();
  const navigate = useNavigate();

  const appendDigit = (digit: string) => {
    setError('');
    setPin(current => `${current}${digit}`.slice(0, 12));
  };

  const handlePadPress = (value: string) => {
    if (value === 'clear') {
      setPin('');
      setError('');
      return;
    }
    if (value === 'del') {
      setPin(current => current.slice(0, -1));
      setError('');
      return;
    }
    appendDigit(value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin.length < 4) {
      setError('Enter at least 4 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (mode === 'create') {
        await createPin(pin);
      } else {
        await signIn(pin);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(current => current === 'unlock' ? 'create' : 'unlock');
    setPin('');
    setError('');
  };

  return (
    <div className="pin-login">
      <form className="pin-panel" onSubmit={handleSubmit}>
        <h1 className="pin-title">Maximus Estimus</h1>
        <div className="pin-mode-row">
          <button
            type="button"
            className={`pin-mode-btn${mode === 'unlock' ? ' active' : ''}`}
            onClick={() => {
              setMode('unlock');
              setPin('');
              setError('');
            }}
          >
            Unlock
          </button>
          <button
            type="button"
            className={`pin-mode-btn${mode === 'create' ? ' active' : ''}`}
            onClick={() => {
              setMode('create');
              setPin('');
              setError('');
            }}
          >
            Save PIN
          </button>
        </div>

        <input
          className="pin-hidden-input"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 12))}
          autoFocus
        />

        <div className="pin-display" aria-label="PIN">
          {pin.length > 0 ? '*'.repeat(pin.length) : '----'}
        </div>

        {error && <div className="pin-error">{error}</div>}

        <div className="pin-pad">
          {DIGITS.map(value => (
            <button
              key={value}
              type="button"
              className="pin-key"
              disabled={loading}
              onClick={() => handlePadPress(value)}
            >
              {value === 'clear' ? 'Clear' : value === 'del' ? 'Del' : value}
            </button>
          ))}
        </div>

        <button className="btn btn-primary btn-full pin-submit" disabled={loading || pin.length < 4}>
          {loading ? 'Working...' : mode === 'create' ? 'Save PIN' : 'Unlock'}
        </button>

        <button type="button" className="pin-alt-action" onClick={toggleMode}>
          {mode === 'unlock' ? 'Create a new PIN' : 'Use an existing PIN'}
        </button>
      </form>
    </div>
  );
}
