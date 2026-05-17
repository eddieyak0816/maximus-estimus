import { useState, useEffect } from 'react';
import { getPhotoUrl } from '../../utils/photoStorage';
import type { PaintingPhotos as PP } from '../../types';

interface Props {
  data: PP;
  onUpdate: (d: PP) => void;
  onCameraOpen: (photoKey: string) => void;
}

function PhotoCheckItem({ label, photoId, onCameraOpen, cameraKey }: {
  label: string;
  photoId?: string;
  onCameraOpen: (key: string) => void;
  cameraKey: string;
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

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

  const taken = !!photoId;

  return (
    <div className={`photo-check-row ${taken ? 'taken' : 'missing'}`} onClick={() => onCameraOpen(cameraKey)}>
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={label}
          className="photo-check-thumb"
          style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }}
        />
      ) : (
        <span className="photo-check-icon">{taken ? '✓' : '○'}</span>
      )}
      <span className="photo-check-label">{label}</span>
    </div>
  );
}

export default function PaintingPhotos({ data, onUpdate, onCameraOpen }: Props) {
  const u = (f: keyof PP, v: string) => onUpdate({ ...data, [f]: v });

  const items = [
    { label: 'Room — full overview', photoId: data.roomOverview, key: 'roomOverview' },
    { label: 'Room — opposite corner', photoId: data.roomCorner, key: 'roomCorner' },
    { label: 'Problem areas (if any)', photoId: data.problemAreas, key: 'problemAreas' },
    { label: 'Catch-all', photoId: data.catchAll, key: 'catchAll' },
  ];

  return (
    <div className="assess-tab">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>
          Photo Checklist ({items.filter(i => !!i.photoId).length} / {items.length})
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Tap any item to take a photo</div>
        <div>
          {items.map(item => (
            <PhotoCheckItem
              key={item.key}
              label={item.label}
              photoId={item.photoId}
              onCameraOpen={onCameraOpen}
              cameraKey={item.key}
            />
          ))}
        </div>
      </div>

      {data.catchAll && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Catch-All Notes</div>
          <textarea
            className="textarea"
            rows={2}
            placeholder="Notes about catch-all photo…"
            value={data.catchAllNotes || ''}
            onChange={e => u('catchAllNotes', e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
