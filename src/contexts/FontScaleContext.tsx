import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface FontScaleContextType {
  scale: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const FontScaleContext = createContext<FontScaleContextType | undefined>(undefined);

const STORAGE_KEY = 'maximus-estimus-font-scale';
const DEFAULT_SCALE = 1;
const SCALE_STEP = 1.1;

export function FontScaleProvider({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(DEFAULT_SCALE);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed) && parsed > 0) {
        setScale(parsed);
      }
    }
  }, []);

  // Update CSS variable whenever scale changes
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', scale.toString());
    localStorage.setItem(STORAGE_KEY, scale.toString());
  }, [scale]);

  const increment = () => setScale(prev => prev * SCALE_STEP);
  const decrement = () => setScale(prev => prev / SCALE_STEP);
  const reset = () => setScale(DEFAULT_SCALE);

  return (
    <FontScaleContext.Provider value={{ scale, increment, decrement, reset }}>
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale() {
  const context = useContext(FontScaleContext);
  if (!context) {
    throw new Error('useFontScale must be used within FontScaleProvider');
  }
  return context;
}
