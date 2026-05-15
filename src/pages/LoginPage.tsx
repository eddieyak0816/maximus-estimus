import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { CreateUserInput } from '../contexts/AuthContext';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'del'];

const emptyUserForm: CreateUserInput & { confirmPin: string } = {
  firstName: '',
  lastName: '',
  email: '',
  pin: '',
  confirmPin: '',
};

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState(emptyUserForm);
  const currentAutoCheckPinRef = useRef<string>('');
  const { signIn, createUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (pin.length < 4 || showCreateUser) return;

    const timer = setTimeout(async () => {
      const autoCheckPin = pin;
      currentAutoCheckPinRef.current = autoCheckPin;
      setError('');
      setLoading(true);

      try {
        await signIn(autoCheckPin);
        if (currentAutoCheckPinRef.current === autoCheckPin) {
          navigate('/');
        }
      } finally {
        if (currentAutoCheckPinRef.current === autoCheckPin) {
          setLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pin, showCreateUser, signIn, navigate]);

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
      await signIn(pin);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newUser.pin !== newUser.confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    try {
      await createUser({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        pin: newUser.pin,
      });
      setShowCreateUser(false);
      setNewUser(emptyUserForm);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create user');
    } finally {
      setLoading(false);
    }
  };

  const updateNewUser = (field: keyof typeof newUser, value: string) => {
    const nextValue = field === 'pin' || field === 'confirmPin'
      ? value.replace(/\D/g, '').slice(0, 12)
      : value;
    setNewUser(current => ({ ...current, [field]: nextValue }));
    setError('');
  };

  return (
    <div className="pin-login">
      <form className="pin-panel" onSubmit={handleSubmit}>
        <h1 className="pin-title">Maximus Estimus</h1>

        <input
          className="pin-hidden-input"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          value={pin}
          onChange={e => { setError(''); setPin(e.target.value.replace(/\D/g, '').slice(0, 12)); }}
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
          Unlock
        </button>

        <button
          type="button"
          className="pin-alt-action"
          onClick={() => {
            setShowCreateUser(true);
            setError('');
          }}
        >
          Create User
        </button>
      </form>

      {showCreateUser && (
        <div className="modal-backdrop" role="presentation">
          <form className="user-modal" onSubmit={handleCreateUser}>
            <div className="user-modal-header">
              <h2>Create User</h2>
              <button
                type="button"
                className="user-modal-close"
                onClick={() => {
                  setShowCreateUser(false);
                  setNewUser(emptyUserForm);
                  setError('');
                }}
              >
                x
              </button>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-field">
                <label className="form-label">First Name</label>
                <input
                  className="input"
                  value={newUser.firstName}
                  onChange={e => updateNewUser('firstName', e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">Last Name</label>
                <input
                  className="input"
                  value={newUser.lastName}
                  onChange={e => updateNewUser('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Email Address</label>
              <input
                className="input"
                type="email"
                value={newUser.email}
                onChange={e => updateNewUser('email', e.target.value)}
                required
              />
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-field">
                <label className="form-label">PIN</label>
                <input
                  className="input"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newUser.pin}
                  onChange={e => updateNewUser('pin', e.target.value)}
                  minLength={4}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">Confirm PIN</label>
                <input
                  className="input"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newUser.confirmPin}
                  onChange={e => updateNewUser('confirmPin', e.target.value)}
                  minLength={4}
                  required
                />
              </div>
            </div>

            {error && <div className="pin-error">{error}</div>}

            <div className="user-modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowCreateUser(false);
                  setNewUser(emptyUserForm);
                  setError('');
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
