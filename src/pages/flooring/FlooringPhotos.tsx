import { useState } from 'react';
import PhotoItem from '../../components/PhotoItem';
import CameraModal from '../../components/CameraModal';
import CustomPhotosSection from '../../components/CustomPhotosSection';
import { savePhoto, deletePhoto } from '../../utils/photoStorage';
import type { FlooringPhotos as FP, FlooringMeasurements, FlooringRoom } from '../../types';

interface Props {
  data: FP;
  measurements: FlooringMeasurements;
  assessmentId: string;
  jobId: string;
  hasStairs: boolean;
  onUpdate: (d: FP) => void;
}

function SecHead({ title }: { title: string }) {
  return <div className="q-sec-head">{title}</div>;
}

type PhotoKey = 'stairs' | 'catchAll' | string;

export default function FlooringPhotos({ data, measurements, assessmentId, jobId, hasStairs, onUpdate }: Props) {
  const [activePhotoKey, setActivePhotoKey] = useState<PhotoKey | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const rooms = measurements.rooms || [];
  const roomPhotos = data.roomPhotos || {};

  const updateRoomPhoto = (id: string, type: 'overview' | 'condition', photoId: string | undefined) =>
    onUpdate({ ...data, roomPhotos: { ...roomPhotos, [id]: { ...roomPhotos[id], [type]: photoId } } });

  const u = (key: keyof FP, val: unknown) => onUpdate({ ...data, [key]: val });

  const roomCaptured = rooms.reduce((n: number, r: FlooringRoom) => {
    const rp = roomPhotos[r.id] || {};
    return n + (rp.overview ? 1 : 0) + (rp.condition ? 1 : 0);
  }, 0);
  const totalItems = rooms.length * 2 + (hasStairs ? 1 : 0) + 1;
  const captured = roomCaptured + (hasStairs && data.stairs ? 1 : 0) + (data.catchAll ? 1 : 0);
  const pct = totalItems > 0 ? Math.round((captured / totalItems) * 100) : 0;

  async function handlePhotoCapture(blob: Blob) {
    try {
      const photoId = await savePhoto(assessmentId, jobId, `${activeRoomId || activePhotoKey}`, blob);

      if (activeRoomId && activePhotoKey) {
        updateRoomPhoto(activeRoomId, activePhotoKey as 'overview' | 'condition', photoId);
      } else if (activePhotoKey) {
        u(activePhotoKey as keyof FP, photoId);
      }
    } catch (err) {
      console.error('Failed to save photo:', err);
    }
    setActivePhotoKey(null);
    setActiveRoomId(null);
  }

  async function handlePhotoRemove(roomId: string | null, type: 'overview' | 'condition' | keyof FP) {
    if (roomId) {
      const photoId = roomPhotos[roomId]?.[type as 'overview' | 'condition'] as string;
      if (photoId) {
        try {
          await deletePhoto(photoId);
        } catch (err) {
          console.error('Failed to delete photo:', err);
        }
      }
      updateRoomPhoto(roomId, type as 'overview' | 'condition', undefined);
    } else {
      const photoId = data[type as keyof FP] as string;
      if (photoId) {
        try {
          await deletePhoto(photoId);
        } catch (err) {
          console.error('Failed to delete photo:', err);
        }
      }
      u(type as keyof FP, undefined);
    }
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

      {rooms.length === 0 && (
        <p className="assess-hint" style={{ textAlign: 'center', padding: '24px 0' }}>
          Add rooms in the Measurements tab first.
        </p>
      )}

      {rooms.map((room: FlooringRoom) => {
        const rp = roomPhotos[room.id] || {};
        return (
          <div key={room.id}>
            <SecHead title={room.label || 'Room'} />
            <PhotoItem label="Full room overview" note="Wide shot of the whole floor area"
              photoId={rp.overview}
              onOpenCamera={() => { setActiveRoomId(room.id); setActivePhotoKey('overview'); }}
              onRemove={() => handlePhotoRemove(room.id, 'overview')} />
            <PhotoItem label="Existing flooring condition" note="Close-up of current floor material"
              photoId={rp.condition}
              onOpenCamera={() => { setActiveRoomId(room.id); setActivePhotoKey('condition'); }}
              onRemove={() => handlePhotoRemove(room.id, 'condition')} />
          </div>
        );
      })}

      {hasStairs && (
        <>
          <SecHead title="Stairs" />
          <PhotoItem label="Stairs — full view" note="All stair treads and risers visible"
            photoId={data.stairs}
            onOpenCamera={() => { setActiveRoomId(null); setActivePhotoKey('stairs'); }}
            onRemove={() => handlePhotoRemove(null, 'stairs')} />
        </>
      )}

      <SecHead title="Misc" />
      <div className="photo-catchall-card">
        <div className="photo-catchall-title">General catch-all</div>
        <div className="photo-catchall-sub">Any additional photos not listed above</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: data.catchAll ? 10 : 0 }}>
          <button
            className={`btn btn-sm${data.catchAll ? ' btn-success' : ' btn-ghost'}`}
            onClick={() => { setActiveRoomId(null); setActivePhotoKey('catchAll'); }}
          >
            {data.catchAll ? '✓ Photo Captured' : '📷 Take Photo'}
          </button>
          {data.catchAll && (
            <button
              className="btn btn-sm remove"
              onClick={() => handlePhotoRemove(null, 'catchAll')}
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
          onCapture={handlePhotoCapture}
          onClose={() => { setActivePhotoKey(null); setActiveRoomId(null); }}
        />
      )}
    </div>
  );
}
