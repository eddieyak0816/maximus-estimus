import { useEffect, useRef, useState } from 'react';
import { getPhotoUrl } from '../utils/photoStorage';
import ImageModal from './ImageModal';

interface Props {
  label: string;
  note?: string;
  photoId?: string;
  onOpenCamera: () => void;
  onFileSelected?: (file: File) => void;
  onRemove?: () => void;
  onViewPhoto?: () => void;
}

interface PhotoItemProps extends Props {
  onUpdateLabel?: (newLabel: string) => void;
}

export default function PhotoItem({ label, note, photoId, onOpenCamera, onFileSelected, onRemove, onViewPhoto, onUpdateLabel }: PhotoItemProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editingLabel, setEditingLabel] = useState(label);
  const captured = !!photoId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photoId) {
      setThumbUrl(null);
      return;
    }

    let mounted = true;
    getPhotoUrl(photoId).then(url => {
      if (mounted) setThumbUrl(url);
    });

    return () => {
      mounted = false;
      if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    };
  }, [photoId]);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onFileSelected) {
      onFileSelected(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleSaveLabel() {
    if (editingLabel.trim() && editingLabel !== label && onUpdateLabel) {
      onUpdateLabel(editingLabel.trim());
    }
    setIsEditingLabel(false);
    setEditingLabel(label);
  }

  function handleCancelLabel() {
    setIsEditingLabel(false);
    setEditingLabel(label);
  }

  return (
    <>
      <div
        className="photo-item"
        onClick={() => {
          // Allow clicking anywhere in the item to view the photo
          if (captured && thumbUrl && onViewPhoto) {
            onViewPhoto();
          }
        }}
        style={{ cursor: captured && thumbUrl ? 'pointer' : 'default' }}
      >
        <div className={`photo-thumb${captured ? ' captured' : ''}`} onClick={(e) => {
          e.stopPropagation();
          if (!captured) onOpenCamera();
        }}>
          {captured && thumbUrl ? (
            <img src={thumbUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg width={captured ? 22 : 20} height={captured ? 22 : 20} viewBox="0 0 24 24" fill={captured ? '#22c55e' : '#3b82f6'}>
              {captured ? (
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              ) : (
                <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24l1.83 2H20v12zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
              )}
            </svg>
          )}
        </div>
        <div className="photo-item-info">
          {isEditingLabel ? (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              <input
                type="text"
                value={editingLabel}
                onChange={e => setEditingLabel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveLabel();
                  if (e.key === 'Escape') handleCancelLabel();
                }}
                autoFocus
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  border: '1px solid #F5C42A',
                  backgroundColor: 'rgba(245, 196, 42, 0.1)',
                  color: 'inherit',
                  minWidth: 0,
                }}
              />
              <button
                onClick={handleSaveLabel}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  background: '#F5C42A',
                  color: '#0d1628',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ✓
              </button>
              <button
                onClick={handleCancelLabel}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'inherit',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
              <div className={`photo-item-label${captured ? ' captured' : ''}`}>{label}</div>
              {captured && onUpdateLabel && (
                <button
                  onClick={() => setIsEditingLabel(true)}
                  title="Edit photo name"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  ✏️
                </button>
              )}
            </div>
          )}
          {note && !captured && <div className="photo-item-note">{note}</div>}
          {captured && <div className="photo-item-done">✓ Photo captured</div>}
        </div>
        <div className="photo-item-buttons">
          {captured && thumbUrl && (
            <button
              className="photo-btn retake"
              onClick={(e) => {
                e.stopPropagation();
                if (onViewPhoto) onViewPhoto();
                else setShowModal(true);
              }}
            >
              View
            </button>
          )}
          <button
            className={`photo-btn${captured ? ' retake' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenCamera();
            }}
          >
            {captured ? 'Retake' : '📷 Take'}
          </button>
          {onFileSelected && (
            <>
              <button
                className={`photo-btn${captured ? ' retake' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                {captured ? '📁 Replace' : '📁 Upload'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                style={{ display: 'none' }}
              />
            </>
          )}
          {captured && onRemove && (
            <button
              className="photo-btn remove"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              title="Delete photo"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {showModal && thumbUrl && (
        <ImageModal
          src={thumbUrl}
          alt={label}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
