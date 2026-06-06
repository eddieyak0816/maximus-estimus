import { useEffect } from 'react';

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
  photoUrls?: string[];
  currentIndex?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function ImageModal({ src, alt, onClose, photoUrls, currentIndex, onPrev, onNext }: Props) {
  const hasMultiple = photoUrls && photoUrls.length > 1;
  const canGoPrev = hasMultiple && currentIndex !== undefined && currentIndex > 0;
  const canGoNext = hasMultiple && currentIndex !== undefined && currentIndex < photoUrls!.length - 1;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleArrows = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoPrev && onPrev) onPrev();
      if (e.key === 'ArrowRight' && canGoNext && onNext) onNext();
    };
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleArrows);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleArrows);
    };
  }, [onClose, canGoPrev, canGoNext, onPrev, onNext]);

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={e => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose} title="Close (Esc)">✕</button>
        <img src={src} alt={alt} className="image-modal-img" />

        {canGoPrev && onPrev && (
          <button
            className="image-modal-nav image-modal-nav-prev"
            onClick={onPrev}
            title="Previous photo (← arrow key)"
            aria-label="Previous photo"
          >
            ‹
          </button>
        )}

        {canGoNext && onNext && (
          <button
            className="image-modal-nav image-modal-nav-next"
            onClick={onNext}
            title="Next photo (→ arrow key)"
            aria-label="Next photo"
          >
            ›
          </button>
        )}

        {hasMultiple && (
          <div className="image-modal-counter">
            {(currentIndex || 0) + 1} / {photoUrls!.length}
          </div>
        )}
      </div>
    </div>
  );
}
