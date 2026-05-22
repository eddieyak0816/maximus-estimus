import { useEffect, useRef, useState } from 'react';
import { getPhotoUrl } from '../utils/photoStorage';

interface Props {
  label: string;
  note?: string;
  photoId?: string;
  onOpenCamera: () => void;
  onFileSelected?: (file: File) => void;
  onRemove?: () => void;
}

export default function PhotoItem({ label, note, photoId, onOpenCamera, onFileSelected, onRemove }: Props) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
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

  return (
    <div className="photo-item">
      <div className={`photo-thumb${captured ? ' captured' : ''}`} onClick={onOpenCamera}>
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
        <div className={`photo-item-label${captured ? ' captured' : ''}`}>{label}</div>
        {note && !captured && <div className="photo-item-note">{note}</div>}
        {captured && <div className="photo-item-done">✓ Photo captured</div>}
      </div>
      <div className="photo-item-buttons">
        <button className={`photo-btn${captured ? ' retake' : ''}`} onClick={onOpenCamera}>
          {captured ? 'Retake' : '📷 Take'}
        </button>
        {onFileSelected && (
          <>
            <button className={`photo-btn${captured ? ' retake' : ''}`} onClick={() => fileInputRef.current?.click()}>
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
          <button className="photo-btn remove" onClick={onRemove} title="Delete photo">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
