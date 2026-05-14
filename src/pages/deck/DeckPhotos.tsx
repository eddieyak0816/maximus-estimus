import { useState } from 'react';
import PhotoItem from '../../components/PhotoItem';
import CameraModal from '../../components/CameraModal';
import { savePhoto, deletePhoto } from '../../utils/photoStorage';
import type { DeckPhotos as DP, DeckMeasurements as DM } from '../../types';

interface Props {
  data: DP;
  measurements: DM;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: DP) => void;
}

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

export default function DeckPhotos({ data, measurements, assessmentId, jobId, onUpdate }: Props) {
  const [activePhotoKey, setActivePhotoKey] = useState<keyof DP | null>(null);
  const u = (key: keyof DP, val: unknown) => onUpdate({ ...data, [key]: val });

  const totalItems = 4 + 1;
  const captured = Object.values(data).filter(v => typeof v === 'string' && v.length > 0).length;
  const pct = totalItems > 0 ? Math.round((captured / totalItems) * 100) : 0;

  async function handlePhotoCapture(photoKey: keyof DP, blob: Blob) {
    try {
      const photoId = await savePhoto(assessmentId, jobId, String(photoKey), blob);
      u(photoKey, photoId);
    } catch (err) {
      console.error('Failed to save photo:', err);
    }
    setActivePhotoKey(null);
  }

  async function handlePhotoRemove(photoKey: keyof DP) {
    const photoId = data[photoKey] as string;
    if (photoId) {
      try {
        await deletePhoto(photoId);
      } catch (err) {
        console.error('Failed to delete photo:', err);
      }
    }
    u(photoKey, undefined);
  }

  return (
    <div className="assess-tab">
      <div className="photo-progress-card">
        <div className="photo-progress-header">
          <span className="photo-progress-label">Photo Progress</span>
          <span className={`photo-progress-count${pct === 100 ? ' done' : ''}`}>
            {captured} / {totalItems}
          </span>
        </div>
        <div className="photo-progress-track">
          <div
            className={`photo-progress-fill${pct === 100 ? ' done' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="photo-progress-hint">All photos optional — tap to capture</div>
      </div>

      <SecHead title="Deck Overview" />
      <PhotoItem
        label="Overall view of deck"
        note="Show the entire deck, surrounding landscape"
        photoId={data.overallView}
        onOpenCamera={() => setActivePhotoKey('overallView')}
        onRemove={() => handlePhotoRemove('overallView')}
      />

      <SecHead title="Details" />
      <PhotoItem
        label="Deck surface condition"
        note="Close-up of decking material, any damage"
        photoId={data.deckSurface}
        onOpenCamera={() => setActivePhotoKey('deckSurface')}
        onRemove={() => handlePhotoRemove('deckSurface')}
      />
      <PhotoItem
        label="Railing / safety features"
        photoId={data.railing}
        onOpenCamera={() => setActivePhotoKey('railing')}
        onRemove={() => handlePhotoRemove('railing')}
      />
      <PhotoItem
        label="Access / stairs / entry points"
        photoId={data.access}
        onOpenCamera={() => setActivePhotoKey('access')}
        onRemove={() => handlePhotoRemove('access')}
      />

      <SecHead title="Problem Areas & Misc" />
      <PhotoItem
        label="Any problem areas or damage"
        note="Rot, warping, loose boards, structural issues"
        photoId={data.problemAreas}
        onOpenCamera={() => setActivePhotoKey('problemAreas')}
        onRemove={() => handlePhotoRemove('problemAreas')}
      />

      <div className="photo-catchall-card">
        <div className="photo-catchall-title">General catch-all</div>
        <div className="photo-catchall-sub">Any additional photos not listed above</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: data.catchAll ? 10 : 0 }}>
          <button
            className={`btn btn-sm${data.catchAll ? ' btn-success' : ' btn-ghost'}`}
            onClick={() => setActivePhotoKey('catchAll')}
          >
            {data.catchAll ? '✓ Photo Captured' : '📷 Take Photo'}
          </button>
          {data.catchAll && (
            <button
              className="btn btn-sm remove"
              onClick={() => handlePhotoRemove('catchAll')}
              title="Delete photo"
            >
              ✕
            </button>
          )}
        </div>
        {data.catchAll && (
          <textarea
            className="textarea"
            rows={3}
            placeholder="Describe what was photographed…"
            value={data.catchAllNotes || ''}
            onChange={e => u('catchAllNotes', e.target.value)}
          />
        )}
      </div>

      {activePhotoKey && (
        <CameraModal
          label={`Capture: ${activePhotoKey}`}
          onCapture={(blob) => handlePhotoCapture(activePhotoKey as keyof DP, blob)}
          onClose={() => setActivePhotoKey(null)}
        />
      )}
    </div>
  );
}
