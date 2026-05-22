import { useState } from 'react';
import PhotoItem from '../../components/PhotoItem';
import CameraModal from '../../components/CameraModal';
import CustomPhotosSection from '../../components/CustomPhotosSection';
import { savePhoto, deletePhoto } from '../../utils/photoStorage';
import type { BathroomPhotos as BP, BathroomMeasurements } from '../../types';

const WALL_LABELS = ['A', 'B', 'C', 'D'] as const;

interface Props {
  data: BP;
  measurements: BathroomMeasurements;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: BP) => void;
}

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

export default function BathroomPhotos({ data, measurements, assessmentId, jobId, onUpdate }: Props) {
  const [activePhotoKey, setActivePhotoKey] = useState<keyof BP | null>(null);
  const u = (key: keyof BP, val: unknown) => onUpdate({ ...data, [key]: val });

  const conditionalCount =
    (measurements.hasTub ? 1 : 0) +
    (measurements.hasShower ? 2 : 0) +
    (measurements.hasLinenCloset ? 1 : 0);
  const totalItems = 3 + WALL_LABELS.length + 2 + conditionalCount + 1;
  const captured = Object.entries(data)
    .filter(([k, v]) => k !== 'catchAllNotes' && typeof v === 'string' && v.length > 0)
    .length;
  const pct = totalItems > 0 ? Math.round((captured / totalItems) * 100) : 0;

  async function handlePhotoCapture(photoKey: keyof BP, _photoLabel: string, blob: Blob) {
    try {
      const photoId = await savePhoto(assessmentId, jobId, String(photoKey), blob);
      u(photoKey, photoId);
    } catch (err) {
      console.error('Failed to save photo:', err);
    }
    setActivePhotoKey(null);
  }

  async function handlePhotoUpload(photoKey: keyof BP, file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    try {
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const photoId = await savePhoto(assessmentId, jobId, String(photoKey), blob);
      u(photoKey, photoId);
    } catch (err) {
      console.error('Failed to upload photo:', err);
      alert('Failed to upload photo');
    }
  }

  async function handlePhotoRemove(photoKey: keyof BP) {
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
          <div className={`photo-progress-fill${pct === 100 ? ' done' : ''}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="photo-progress-hint">All photos optional — tap to mark as captured</div>
      </div>

      <SecHead title="Room Overview" />
      <PhotoItem label="Full room — from entrance" note="Wide angle from doorway"
        photoId={data.roomEntrance}
        onOpenCamera={() => setActivePhotoKey('roomEntrance')}
        onFileSelected={(file) => handlePhotoUpload('roomEntrance', file)}
        onRemove={() => handlePhotoRemove('roomEntrance')} />
      <PhotoItem label="Full room — opposite corner" note="Capture the whole space"
        photoId={data.roomCorner}
        onOpenCamera={() => setActivePhotoKey('roomCorner')}
        onFileSelected={(file) => handlePhotoUpload('roomCorner', file)}
        onRemove={() => handlePhotoRemove('roomCorner')} />
      <PhotoItem label="Floor overview" note="Full floor condition and material"
        photoId={data.floor}
        onOpenCamera={() => setActivePhotoKey('floor')}
        onFileSelected={(file) => handlePhotoUpload('floor', file)}
        onRemove={() => handlePhotoRemove('floor')} />

      <SecHead title="Walls" />
      {WALL_LABELS.map(wall => {
        const photoKey = `wall${wall}` as keyof BP;
        return (
          <PhotoItem key={wall} label={`Wall ${wall} — straight on`} note="Full wall shot captures everything"
            photoId={data[photoKey] as string}
            onOpenCamera={() => setActivePhotoKey(photoKey)}
            onFileSelected={(file) => handlePhotoUpload(photoKey, file)}
            onRemove={() => handlePhotoRemove(photoKey)} />
        );
      })}

      {(measurements.hasTub || measurements.hasShower) && (
        <>
          <SecHead title="Tub & Shower" />
          {measurements.hasTub && (
            <PhotoItem label="Tub — full view"
              photoId={data.tub}
              onOpenCamera={() => setActivePhotoKey('tub')}
              onFileSelected={(file) => handlePhotoUpload('tub', file)}
              onRemove={() => handlePhotoRemove('tub')} />
          )}
          {measurements.hasShower && (
            <>
              <PhotoItem label="Shower — full view"
                photoId={data.shower}
                onOpenCamera={() => setActivePhotoKey('shower')}
                onFileSelected={(file) => handlePhotoUpload('shower', file)}
                onRemove={() => handlePhotoRemove('shower')} />
              <PhotoItem label="Shower — floor and drain"
                photoId={data.showerFloor}
                onOpenCamera={() => setActivePhotoKey('showerFloor')}
                onFileSelected={(file) => handlePhotoUpload('showerFloor', file)}
                onRemove={() => handlePhotoRemove('showerFloor')} />
            </>
          )}
        </>
      )}

      <SecHead title="Vanity & Fixtures" />
      <PhotoItem label="Vanity — full view"
        photoId={data.vanity}
        onOpenCamera={() => setActivePhotoKey('vanity')}
        onFileSelected={(file) => handlePhotoUpload('vanity', file)}
        onRemove={() => handlePhotoRemove('vanity')} />
      <PhotoItem label="Toilet area"
        photoId={data.toilet}
        onOpenCamera={() => setActivePhotoKey('toilet')}
        onFileSelected={(file) => handlePhotoUpload('toilet', file)}
        onRemove={() => handlePhotoRemove('toilet')} />

      {measurements.hasLinenCloset && (
        <>
          <SecHead title="Linen Closet" />
          <PhotoItem label="Linen closet — full view"
            photoId={data.linenCloset}
            onOpenCamera={() => setActivePhotoKey('linenCloset')}
            onFileSelected={(file) => handlePhotoUpload('linenCloset', file)}
            onRemove={() => handlePhotoRemove('linenCloset')} />
        </>
      )}

      <SecHead title="Problem Areas & Misc" />
      <PhotoItem label="Any problem areas or damage" note="Cracks, water damage, mold"
        photoId={data.problemAreas}
        onOpenCamera={() => setActivePhotoKey('problemAreas')}
        onFileSelected={(file) => handlePhotoUpload('problemAreas', file)}
        onRemove={() => handlePhotoRemove('problemAreas')} />

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
          <textarea className="textarea" rows={3} placeholder="Describe what was photographed…"
            value={data.catchAllNotes || ''} onChange={e => u('catchAllNotes', e.target.value)} />
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
          onCapture={(blob) => handlePhotoCapture(activePhotoKey as keyof BP, String(activePhotoKey), blob)}
          onClose={() => setActivePhotoKey(null)}
        />
      )}
    </div>
  );
}
