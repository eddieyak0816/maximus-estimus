import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { savePhoto, deletePhoto } from '../utils/photoStorage';
import PhotoItem from './PhotoItem';
import CameraModal from './CameraModal';
import type { CustomPhoto } from '../types';

interface Props {
  photos: CustomPhoto[];
  measurements?: object;
  assessmentId: string;
  jobId: string;
  onUpdate: (photos: CustomPhoto[]) => void;
}

export default function PhotosTab({ photos = [], measurements, assessmentId, jobId, onUpdate }: Props) {
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Extract wall names from measurements
  const wallNames = extractWallLabels(measurements || {});

  // Default photo categories
  const defaultCategories = [
    'Room Overview',
    'Floor',
    'Problem Areas',
    'Lighting',
    'Electrical',
    'Existing Cabinets',
    'Countertops',
    'Backsplash',
    'Island',
    'Walls',
    'Fixtures',
    'Windows',
    'Doors',
  ];

  // Combine wall names + defaults, remove duplicates
  const allCategories = [...new Set([...wallNames, ...defaultCategories])].sort();

  async function handlePhotoCapture(blob: Blob) {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    try {
      const photoId = await savePhoto(assessmentId, jobId, `photo-${uuidv4()}`, blob);
      if (activePhotoId && activePhotoId !== 'new') {
        const existingPhoto = photos.find(p => p.id === activePhotoId);
        if (existingPhoto) {
          deletePhoto(existingPhoto.photoId).catch(err => console.error('Failed to delete replaced photo:', err));
          onUpdate(photos.map(p => p.id === activePhotoId ? { ...p, label: selectedCategory, photoId } : p));
          resetForm();
          return;
        }
      }

      const newPhoto: CustomPhoto = {
        id: uuidv4(),
        label: selectedCategory,
        photoId,
      };
      onUpdate([...photos, newPhoto]);
      resetForm();
    } catch (err) {
      console.error('Failed to save photo:', err);
      alert('Failed to save photo');
    }
  }

  async function handlePhotoUpload(file: File) {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const photoId = await savePhoto(assessmentId, jobId, `photo-${uuidv4()}`, blob);
      const newPhoto: CustomPhoto = {
        id: uuidv4(),
        label: selectedCategory,
        photoId,
      };
      onUpdate([...photos, newPhoto]);
      resetForm();
    } catch (err) {
      console.error('Failed to upload photo:', err);
      alert('Failed to upload photo');
    }
  }

  async function handlePhotoRemove(id: string) {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      try {
        await deletePhoto(photo.photoId);
        onUpdate(photos.filter(p => p.id !== id));
      } catch (err) {
        console.error('Failed to delete photo:', err);
        alert('Failed to delete photo');
      }
    }
  }

  function resetForm() {
    setSelectedCategory('');
    setShowAddForm(false);
    setActivePhotoId(null);
  }

  return (
    <div className="assess-tab">
      <div className="photo-progress-card">
        <div className="photo-progress-header">
          <span className="photo-progress-label">Photos</span>
          <span className="photo-progress-count">{photos.length}</span>
        </div>
        <div className="photo-progress-hint">Add photos to document the job</div>
      </div>

      {photos.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {photos.map(photo => (
            <PhotoItem
              key={photo.id}
              label={photo.label}
              photoId={photo.photoId}
              onOpenCamera={() => {
                setSelectedCategory(photo.label);
                setActivePhotoId(photo.id);
              }}
              onFileSelected={(file) => {
                setSelectedCategory(photo.label);
                handlePhotoUpload(file);
              }}
              onRemove={() => handlePhotoRemove(photo.id)}
            />
          ))}
        </div>
      )}

      {!showAddForm ? (
        <button
          className="btn btn-outline"
          style={{ width: '100%' }}
          onClick={() => setShowAddForm(true)}
        >
          ➕ Add Photo
        </button>
      ) : (
        <div className="custom-photo-form">
          <div style={{ marginBottom: '12px' }}>
            <div className="tiny-label" style={{ marginBottom: '6px' }}>Photo Category</div>
            <select
              className="dropdown-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">Select a category...</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="">──────────────</option>
              <option value="other">Other (custom)</option>
            </select>
          </div>

          {selectedCategory === 'other' && (
            <input
              type="text"
              className="input"
              placeholder="Enter custom category name…"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              maxLength={50}
              style={{ marginBottom: '12px' }}
            />
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
              onClick={() => setActivePhotoId('new')}
              disabled={!selectedCategory}
            >
              📷 Take
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: '1 1 calc(50% - 4px)', minWidth: '100px' }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = () => {
                  const file = input.files?.[0];
                  if (file) handlePhotoUpload(file);
                };
                input.click();
              }}
              disabled={!selectedCategory}
            >
              📁 Upload
            </button>
            <button
              className="btn btn-ghost"
              style={{ flex: '0 1 auto', minWidth: '40px' }}
              onClick={() => {
                setShowAddForm(false);
                setSelectedCategory('');
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {activePhotoId && selectedCategory && (
        <CameraModal
          label={`Photo: ${selectedCategory}`}
          onCapture={handlePhotoCapture}
          onClose={() => setActivePhotoId(null)}
        />
      )}
    </div>
  );
}

function extractWallLabels(measurements: object): string[] {
  const walls = (measurements as { walls?: Record<string, { label?: string }> }).walls;
  if (!walls) return [];
  return Object.values(walls)
    .map(w => w?.label || '')
    .filter(Boolean);
}
