import { useState } from 'react';
import PhotoItem from '../../components/PhotoItem';
import CameraModal from '../../components/CameraModal';
import CustomPhotosSection from '../../components/CustomPhotosSection';
import { savePhoto, deletePhoto } from '../../utils/photoStorage';
import type { LivingRoomPhotos as LP, CustomPhoto } from '../../types';

interface Props {
  data: LP;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: LP) => void;
}

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

export default function LivingRoomPhotos({ data, assessmentId, jobId, onUpdate }: Props) {
  const [activePhotoKey, setActivePhotoKey] = useState<keyof LP | null>(null);
  const u = (key: keyof LP, val: unknown) => onUpdate({ ...data, [key]: val });

  const totalItems = 3 + 2;
  const captured = Object.values(data).filter(v => typeof v === 'string' && v.length > 0).length;
  const pct = totalItems > 0 ? Math.round((captured / totalItems) * 100) : 0;

  async function handlePhotoCapture(photoKey: keyof LP, blob: Blob) {
    try {
      const photoId = await savePhoto(assessmentId, jobId, String(photoKey), blob);
      u(photoKey, photoId);
    } catch (err) {
      console.error('Failed to save photo:', err);
    }
    setActivePhotoKey(null);
  }

  async function handlePhotoRemove(photoKey: keyof LP) {
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

      <SecHead title="Room Overview" />
      <PhotoItem
        label="Full room — from entrance"
        note="Wide angle from doorway"
        photoId={data.roomOverview}
        onOpenCamera={() => setActivePhotoKey('roomOverview')}
        onRemove={() => handlePhotoRemove('roomOverview')}
      />
      <PhotoItem
        label="Full room — opposite corner"
        note="Capture the whole space"
        photoId={data.roomCorner}
        onOpenCamera={() => setActivePhotoKey('roomCorner')}
        onRemove={() => handlePhotoRemove('roomCorner')}
      />

      <SecHead title="Details" />
      <PhotoItem
        label="Flooring condition"
        photoId={data.flooring}
        onOpenCamera={() => setActivePhotoKey('flooring')}
        onRemove={() => handlePhotoRemove('flooring')}
      />
      <PhotoItem
        label="Lighting fixtures"
        photoId={data.lighting}
        onOpenCamera={() => setActivePhotoKey('lighting')}
        onRemove={() => handlePhotoRemove('lighting')}
      />

      <SecHead title="Problem Areas & Misc" />
      <PhotoItem
        label="Any problem areas or damage"
        note="Cracks, water damage, uneven surfaces"
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

      <CustomPhotosSection
        photos={data.customPhotos || []}
        assessmentId={assessmentId}
        jobId={jobId}
        onUpdate={(customPhotos) => u('customPhotos', customPhotos)}
      />

      {activePhotoKey && (
        <CameraModal
          label={`Capture: ${activePhotoKey}`}
          onCapture={(blob) => handlePhotoCapture(activePhotoKey as keyof LP, blob)}
          onClose={() => setActivePhotoKey(null)}
        />
      )}
    </div>
  );
}
