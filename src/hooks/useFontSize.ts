import { useEffect, useState } from 'react';

export type FontSize = 'small' | 'normal' | 'large';

const FONT_SIZE_KEY = 'maximus-estimus-font-size';
const DEFAULT_FONT_SIZE: FontSize = 'normal';

export function useFontSize() {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    return (stored as FontSize) || DEFAULT_FONT_SIZE;
  });

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_SIZE_KEY, size);
    applyFontSize(size);
  };

  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);

  return { fontSize, setFontSize };
}

function applyFontSize(size: FontSize) {
  const html = document.documentElement;
  if (size === 'normal') {
    html.removeAttribute('data-font-size');
  } else {
    html.setAttribute('data-font-size', size);
  }
}
