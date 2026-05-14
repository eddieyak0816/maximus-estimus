import { useState } from 'react';
import PhotoItem from '../../components/PhotoItem';
import CameraModal from '../../components/CameraModal';
import { savePhoto, deletePhoto } from '../../utils/photoStorage';
import type { KitchenPhotos as KP, KitchenMeasurements as KM } from '../../types';

const WALL_LABELS = ['A', 'B', 'C', 'D'] as const;

interface Props {
  data: KP;
  measurements: KM;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: KP) => void;
}

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

export default function KitchenPhotos({ data, measurements, assessmentId, jobId, onUpdate }: Props) {
  const [activePhotoKey, setActivePhotoKey] = useState<keyof KP | null>(null);
  const u = (key: keyof KP, val: unknown) => onUpdate({ ...data, [key]: val });

  const hasAnyCabinets = Object.values(measurements.walls).some(
    w => w.hasUpperCabs || w.hasBaseCabs || w.hasTallCab
  );
  const conditionalCount =
    (measurements.hasIsland ? 1 : 0) +
    (hasAnyCabinets ? 3 : 0);
  const totalItems = 3 + WALL_LABELS.length + conditionalCount + 3;
  const captured = Object.values(data).filter(v => typeof v === 'string' && v.length > 0).length;
  const pct = totalItems > 0 ? Math.round((captured / totalItems) * 100) : 0;

  async function handlePhotoCapture(photoKey: keyof KP, _photoLabel: string, blob: Blob) {
    try {
      const photoId = await savePhoto(assessmentId, jobId, String(photoKey), blob);
      u(photoKey, photoId);
    } catch (err) {
      console.error('Failed to save photo:', err);
    }
    setActivePhotoKey(null);
  }

  async function handlePhotoRemove(photoKey: keyof KP) {
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
        <div className="photo-progress-hint">All photos optional — tap to mark as captured</div>
      </div>

      <SecHead title="Room Overview" />
      <PhotoItem
        label="Full room — from entrance"
        note="Wide angle from doorway"
        photoId={data.roomEntrance}
        onOpenCamera={() => setActivePhotoKey('roomEntrance')}
        onRemove={() => handlePhotoRemove('roomEntrance')}
      />
      <PhotoItem
        label="Full room — opposite corner"
        note="Capture the whole space"
        photoId={data.roomCorner}
        onOpenCamera={() => setActivePhotoKey('roomCorner')}
        onRemove={() => handlePhotoRemove('roomCorner')}
      />
      <PhotoItem
        label="Floor overview"
        note="Full floor condition and material"
        photoId={data.floor}
        onOpenCamera={() => setActivePhotoKey('floor')}
        onRemove={() => handlePhotoRemove('floor')}
      />

      <SecHead title="Walls" />
      {WALL_LABELS.map(wall => {
        const photoKey = `wall${wall}` as keyof KP;
        return (
          <PhotoItem
            key={wall}
            label={`Wall ${wall} — straight on`}
            note="Full wall shot captures everything"
            photoId={data[photoKey] as string}
            onOpenCamera={() => setActivePhotoKey(photoKey)}
            onRemove={() => handlePhotoRemove(photoKey)}
          />
        );
      })}

      {measurements.hasIsland && (
        <>
          <SecHead title="Island" />
          <PhotoItem
            label="Island — full view"
            note="All sides visible if possible"
            photoId={data.island}
            onOpenCamera={() => setActivePhotoKey('island')}
            onRemove={() => handlePhotoRemove('island')}
          />
        </>
      )}

      {hasAnyCabinets && (
        <>
          <SecHead title="Existing Cabinets" />
          <PhotoItem
            label="Upper cabinets — full view"
            photoId={data.cabUppers}
            onOpenCamera={() => setActivePhotoKey('cabUppers')}
            onRemove={() => handlePhotoRemove('cabUppers')}
          />
          <PhotoItem
            label="Base cabinets — full view"
            photoId={data.cabBase}
            onOpenCamera={() => setActivePhotoKey('cabBase')}
            onRemove={() => handlePhotoRemove('cabBase')}
          />
          <PhotoItem
            label="Tall / pantry cabinet — full view"
            photoId={data.cabTall}
            onOpenCamera={() => setActivePhotoKey('cabTall')}
            onRemove={() => handlePhotoRemove('cabTall')}
          />
        </>
      )}

      <SecHead title="Problem Areas & Misc" />
      <PhotoItem
        label="Any problem areas or damage"
        note="Cracks, water damage, uneven surfaces"
        photoId={data.problemAreas}
        onOpenCamera={() => setActivePhotoKey('problemAreas')}
        onRemove={() => handlePhotoRemove('problemAreas')}
      />
      <PhotoItem
        label="Anything unusual or out of square"
        note="Document anything affecting install"
        photoId={data.unusual}
        onOpenCamera={() => setActivePhotoKey('unusual')}
        onRemove={() => handlePhotoRemove('unusual')}
      />
      <PhotoItem
        label="Electrical panel"
        note="Only if relevant to this job"
        photoId={data.electricalPanel}
        onOpenCamera={() => setActivePhotoKey('electricalPanel')}
        onRemove={() => handlePhotoRemove('electricalPanel')}
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
          onCapture={(blob) => handlePhotoCapture(activePhotoKey as keyof KP, String(activePhotoKey), blob)}
          onClose={() => setActivePhotoKey(null)}
        />
      )}
    </div>
  );
}
