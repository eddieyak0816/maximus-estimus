import { useEffect, useState } from 'react';

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
  photoUrls?: string[];
  currentIndex?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onRotate?: (newRotation: number) => void;
  currentRotation?: number;
  isVideo?: boolean;
}

export default function ImageModal({ src, alt, onClose, photoUrls, currentIndex, onPrev, onNext, onRotate, currentRotation = 0, isVideo = false }: Props) {
  const [rotation, setRotation] = useState(currentRotation);
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

  function handleRotate() {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (onRotate) {
      onRotate(newRotation);
    }
  }

  const rotationStyle = rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : {};

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={e => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose} title="Close (Esc)">✕</button>

        {isVideo ? (
          <video
            src={src}
            controls
            className="image-modal-img"
            style={rotationStyle}
          />
        ) : (
          <img src={src} alt={alt} className="image-modal-img" style={rotationStyle} />
        )}

        {!isVideo && (
          <button
            className="image-modal-rotate"
            onClick={handleRotate}
            title="Rotate 90° clockwise (R)"
            aria-label="Rotate image"
          >
            🔄
          </button>
        )}

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
