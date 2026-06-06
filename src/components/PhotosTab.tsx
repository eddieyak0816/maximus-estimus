import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { savePhoto, deletePhoto, getPhotoUrl } from '../utils/photoStorage';
import PhotoItem from './PhotoItem';
import CameraModal from './CameraModal';
import ImageModal from './ImageModal';
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
  const [burstMode, setBurstMode] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState<number | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const burstPhotosRef = useRef<CustomPhoto[]>(photos);

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

  async function handleBurstCapture(blob: Blob) {
    try {
      const photoNumber = burstPhotosRef.current.length + 1;
      const photoId = await savePhoto(assessmentId, jobId, `photo-${uuidv4()}`, blob);
      const newPhoto: CustomPhoto = {
        id: uuidv4(),
        label: `Photo ${photoNumber}`,
        photoId,
      };
      burstPhotosRef.current = [...burstPhotosRef.current, newPhoto];
      onUpdate(burstPhotosRef.current);
    } catch (err) {
      console.error('Failed to save burst photo:', err);
    }
  }

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

  async function handleBulkUpload(files: FileList) {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    if (files.length === 0) return;

    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('No image files selected');
      return;
    }

    const newPhotos: CustomPhoto[] = [];
    setBulkUploadProgress({ current: 0, total: validFiles.length });

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const blob = new Blob([await file.arrayBuffer()], { type: file.type });
        const photoId = await savePhoto(assessmentId, jobId, `photo-${uuidv4()}`, blob);
        newPhotos.push({
          id: uuidv4(),
          label: selectedCategory,
          photoId,
        });
        setBulkUploadProgress({ current: i + 1, total: validFiles.length });
      }

      // Update all at once
      onUpdate([...photos, ...newPhotos]);
      resetForm();
      setBulkUploadProgress(null);
    } catch (err) {
      console.error('Failed to bulk upload photos:', err);
      alert(`Failed to upload ${validFiles.length - newPhotos.length} photos`);
      setBulkUploadProgress(null);
    }
  }

  function resetForm() {
    setSelectedCategory('');
    setShowAddForm(false);
    setActivePhotoId(null);
  }

  async function handleOpenPhoto(index: number) {
    const urls = await Promise.all(
      photos.map(p => getPhotoUrl(p.photoId))
    );
    const validUrls = urls.filter((url): url is string => url !== null);
    setPhotoUrls(validUrls);
    setViewingPhotoIndex(index);
  }

  function handleClosePhoto() {
    setViewingPhotoIndex(null);
    setPhotoUrls([]);
  }

  function handlePrevPhoto() {
    if (viewingPhotoIndex !== null && viewingPhotoIndex > 0) {
      setViewingPhotoIndex(viewingPhotoIndex - 1);
    }
  }

  function handleNextPhoto() {
    if (viewingPhotoIndex !== null && viewingPhotoIndex < photos.length - 1) {
      setViewingPhotoIndex(viewingPhotoIndex + 1);
    }
  }

  return (
    <div className="assess-tab">
      <div className="photo-progress-card">
        <div className="photo-progress-header">
          <span className="photo-progress-label">Photos</span>
          <span className="photo-progress-count">{photos.length}</span>
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                style={{
                  background: viewMode === 'list' ? '#F5C42A' : 'rgba(255, 255, 255, 0.1)',
                  color: viewMode === 'list' ? '#0d1628' : 'inherit',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                ≡ List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                style={{
                  background: viewMode === 'grid' ? '#F5C42A' : 'rgba(255, 255, 255, 0.1)',
                  color: viewMode === 'grid' ? '#0d1628' : 'inherit',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                ⊞ Grid
              </button>
            </div>
          )}
        </div>
        <div className="photo-progress-hint">Add photos to document the job</div>
      </div>

      {photos.length > 0 && (
        <div
          style={
            viewMode === 'grid'
              ? {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }
              : { marginBottom: '20px' }
          }
        >
          {photos.map((photo, index) => (
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
              onViewPhoto={() => handleOpenPhoto(index)}
              onUpdateLabel={(newLabel) => {
                const updatedPhotos = photos.map(p =>
                  p.id === photo.id ? { ...p, label: newLabel } : p
                );
                onUpdate(updatedPhotos);
              }}
            />
          ))}
        </div>
      )}

      {!showAddForm ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => {
              burstPhotosRef.current = photos;
              setBurstMode(true);
            }}
          >
            📷 Quick Shoot
          </button>
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={() => setShowAddForm(true)}
          >
            ➕ Add Photo
          </button>
        </div>
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
              disabled={!selectedCategory || bulkUploadProgress !== null}
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
                input.multiple = true;
                input.onchange = () => {
                  if (input.files) {
                    if (input.files.length === 1) {
                      handlePhotoUpload(input.files[0]);
                    } else if (input.files.length > 1) {
                      handleBulkUpload(input.files);
                    }
                  }
                };
                input.click();
              }}
              disabled={!selectedCategory || bulkUploadProgress !== null}
              title="Upload one or more photos"
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

          {bulkUploadProgress && (
            <div style={{ marginTop: '12px', padding: '8px', backgroundColor: 'rgba(245, 196, 42, 0.1)', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', marginBottom: '6px', color: '#F5C42A' }}>
                Uploading {bulkUploadProgress.current} of {bulkUploadProgress.total}...
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#F5C42A',
                    width: `${(bulkUploadProgress.current / bulkUploadProgress.total) * 100}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activePhotoId && selectedCategory && (
        <CameraModal
          label={`Photo: ${selectedCategory}`}
          onCapture={handlePhotoCapture}
          onClose={() => setActivePhotoId(null)}
        />
      )}

      {burstMode && (
        <CameraModal
          label="Quick Shoot"
          onCapture={handleBurstCapture}
          onClose={() => setBurstMode(false)}
          burstMode
        />
      )}

      {viewingPhotoIndex !== null && photoUrls.length > 0 && photoUrls[viewingPhotoIndex] && (
        <ImageModal
          src={photoUrls[viewingPhotoIndex]}
          alt={photos[viewingPhotoIndex]?.label || 'Photo'}
          onClose={handleClosePhoto}
          photoUrls={photoUrls}
          currentIndex={viewingPhotoIndex}
          onPrev={handlePrevPhoto}
          onNext={handleNextPhoto}
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
