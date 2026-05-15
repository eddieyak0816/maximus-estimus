import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PIN_SESSION_KEY = 'maximus-estimus-pin-session';

export interface PinUser {
  id: string;
  pin: string;
  createdAt?: string;
}

interface PinUserRow {
  id: string;
  pin: string;
  created_at?: string;
}

interface AuthContextType {
  user: PinUser | null;
  loading: boolean;
  signIn: (pin: string) => Promise<void>;
  createPin: (pin: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function cleanPin(pin: string) {
  return pin.replace(/\D/g, '');
}

function toPinUser(row: PinUserRow): PinUser {
  return {
    id: row.id,
    pin: row.pin,
    createdAt: row.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PinUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PIN_SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (pin: string) => {
    const normalized = cleanPin(pin);
    if (normalized.length < 4) throw new Error('PIN must be at least 4 digits');

    const { data, error } = await supabase
      .from('pin_users')
      .select('id,pin,created_at')
      .eq('pin', normalized)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('PIN not found');

    const nextUser = toPinUser(data as PinUserRow);
    localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const createPin = async (pin: string) => {
    const normalized = cleanPin(pin);
    if (normalized.length < 4) throw new Error('PIN must be at least 4 digits');

    const { data: existing, error: lookupError } = await supabase
      .from('pin_users')
      .select('id')
      .eq('pin', normalized)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existing) throw new Error('That PIN is already taken');

    const { data, error } = await supabase
      .from('pin_users')
      .insert({ pin: normalized })
      .select('id,pin,created_at')
      .single();

    if (error) throw error;

    const nextUser = toPinUser(data as PinUserRow);
    localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const signOut = async () => {
    localStorage.removeItem(PIN_SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, createPin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
