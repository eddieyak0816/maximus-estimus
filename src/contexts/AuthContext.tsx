import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PIN_SESSION_KEY = 'maximus-estimus-pin-session';

export interface PinUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pin: string;
  isAdmin: boolean;
  createdAt?: string;
}

interface PinUserRow {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  pin: string;
  is_admin?: boolean;
  created_at?: string;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  pin: string;
}

interface AuthContextType {
  user: PinUser | null;
  loading: boolean;
  signIn: (pin: string) => Promise<void>;
  createUser: (input: CreateUserInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message?: unknown }).message || fallback);
  }
  return fallback;
}

function cleanPin(pin: string) {
  return pin.replace(/\D/g, '');
}

function toPinUser(row: PinUserRow): PinUser {
  return {
    id: row.id,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    email: row.email || '',
    pin: row.pin,
    isAdmin: row.is_admin || false,
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
      .select('id,first_name,last_name,email,pin,is_admin,created_at')
      .eq('pin', normalized)
      .maybeSingle();

    if (error) throw new Error(getErrorMessage(error, 'Could not look up PIN'));
    if (!data) throw new Error('PIN not found');

    const nextUser = toPinUser(data as PinUserRow);
    localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const createUser = async (input: CreateUserInput) => {
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const email = input.email.trim().toLowerCase();
    const pin = input.pin;
    const normalized = cleanPin(pin);

    if (!firstName) throw new Error('First name is required');
    if (!lastName) throw new Error('Last name is required');
    if (!email) throw new Error('Email is required');
    if (!email.includes('@')) throw new Error('Enter a valid email');
    if (normalized.length < 4) throw new Error('PIN must be at least 4 digits');

    const { data: existingPin, error: pinLookupError } = await supabase
      .from('pin_users')
      .select('id')
      .eq('pin', normalized)
      .maybeSingle();

    if (pinLookupError) throw new Error(getErrorMessage(pinLookupError, 'Could not check PIN'));
    if (existingPin) throw new Error('That PIN is already taken');

    const { data: existingEmail, error: emailLookupError } = await supabase
      .from('pin_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (emailLookupError) throw new Error(getErrorMessage(emailLookupError, 'Could not check email'));
    if (existingEmail) throw new Error('That email is already registered');

    const { data, error } = await supabase
      .from('pin_users')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        pin: normalized,
      })
      .select('id,first_name,last_name,email,pin,is_admin,created_at')
      .single();

    if (error) throw new Error(getErrorMessage(error, 'Could not create user'));

    const nextUser = toPinUser(data as PinUserRow);
    localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const signOut = async () => {
    localStorage.removeItem(PIN_SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, createUser, signOut }}>
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
