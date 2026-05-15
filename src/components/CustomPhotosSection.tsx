import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { savePhoto, deletePhoto } from '../utils/photoStorage';
import type { CustomPhoto } from '../types';
import PhotoItem from './PhotoItem';
import CameraModal from './CameraModal';

interface Props {
  photos: CustomPhoto[];
  assessmentId: string;
  jobId: string;
  onUpdate: (photos: CustomPhoto[]) => void;
}

export default function CustomPhotosSection({ photos = [], assessmentId, jobId, onUpdate }: Props) {
  const [newPhotoLabel, setNewPhotoLabel] = useState('');
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [showLabelForm, setShowLabelForm] = useState(false);

  async function handleAddCustomPhoto(blob: Blob) {
    if (!newPhotoLabel.trim()) {
      alert('Please enter a label for the custom photo');
      return;
    }

    try {
      const photoId = await savePhoto(assessmentId, jobId, `custom-${uuidv4()}`, blob);
      const newPhoto: CustomPhoto = {
        id: uuidv4(),
        label: newPhotoLabel.trim(),
        photoId,
      };
      onUpdate([...photos, newPhoto]);
      setNewPhotoLabel('');
      setActivePhotoId(null);
      setShowLabelForm(false);
    } catch (err) {
      console.error('Failed to save custom photo:', err);
      alert('Failed to save photo');
    }
  }

  async function handleRemoveCustomPhoto(id: string) {
    if (!window.confirm('Delete this photo?')) return;

    const photo = photos.find(p => p.id === id);
    if (photo) {
      try {
        await deletePhoto(photo.photoId);
        onUpdate(photos.filter(p => p.id !== id));
      } catch (err) {
        console.error('Failed to delete custom photo:', err);
        alert('Failed to delete photo');
      }
    }
  }

  return (
    <div className="custom-photos-section">
      <div className="photo-catchall-card">
        <div className="photo-catchall-title">Custom Photos</div>
        <div className="photo-catchall-sub">Add your own photos with descriptions</div>
      </div>

      {photos.length > 0 && (
        <div className="custom-photos-list">
          {photos.map(photo => (
            <PhotoItem
              key={photo.id}
              label={photo.label}
              photoId={photo.photoId}
              onOpenCamera={() => setActivePhotoId(photo.id)}
              onRemove={() => handleRemoveCustomPhoto(photo.id)}
            />
          ))}
        </div>
      )}

      {!showLabelForm ? (
        <button
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '12px' }}
          onClick={() => setShowLabelForm(true)}
        >
          + Add Custom Photo
        </button>
      ) : (
        <div className="custom-photo-form">
          <input
            type="text"
            className="input"
            placeholder="Enter photo description (e.g., 'Existing damage on wall')"
            value={newPhotoLabel}
            onChange={e => setNewPhotoLabel(e.target.value)}
            maxLength={100}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => setActivePhotoId('new')}
            >
              Take Photo
            </button>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={() => {
                setShowLabelForm(false);
                setNewPhotoLabel('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activePhotoId && (
        <CameraModal
          label={activePhotoId === 'new' ? newPhotoLabel : 'Review Custom Photo'}
          onClose={() => setActivePhotoId(null)}
          onCapture={(blob, _label) => handleAddCustomPhoto(blob)}
        />
      )}
    </div>
  );
}
