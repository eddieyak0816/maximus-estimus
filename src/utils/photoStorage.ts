import { supabase } from '../lib/supabase';

// IndexedDB photo storage for real camera captures (offline cache)
const DB_NAME = 'maximus-estimus-photos';
const DB_VERSION = 1;
const STORE_NAME = 'photos';
const BUCKET_NAME = 'assessment-photos';

interface PhotoMetadata {
  id: string;
  assessmentId: string;
  jobId: string;
  photoKey: string;
  timestamp: number;
  blob: Blob;
}

let db: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };

    req.onupgradeneeded = (e) => {
      const database = (e.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('assessmentId', 'assessmentId', { unique: false });
        store.createIndex('photoKey', 'photoKey', { unique: false });
      }
    };
  });
}

export async function savePhoto(
  assessmentId: string,
  jobId: string,
  photoKey: string,
  blob: Blob,
): Promise<string> {
  const database = await openDB();
  const timestamp = Date.now();
  const photoId = `${assessmentId}/${jobId}/${photoKey}-${timestamp}`;

  // Save to IndexedDB immediately (offline cache)
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const metadata: PhotoMetadata = {
      id: photoId,
      assessmentId,
      jobId,
      photoKey,
      timestamp,
      blob,
    };

    const req = store.put(metadata);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      // Upload to Supabase Storage in background
      uploadPhotoToSupabase(photoId, blob).catch(console.error);
      resolve(photoId);
    };
  });
}

async function uploadPhotoToSupabase(path: string, blob: Blob): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, blob, { upsert: true });
  if (error) console.error('Failed to upload photo to Supabase:', error);
}

export async function getPhoto(photoId: string): Promise<Blob | null> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(photoId);

    req.onerror = () => reject(req.error);
    req.onsuccess = async () => {
      const metadata = req.result as PhotoMetadata | undefined;
      if (metadata?.blob) {
        resolve(metadata.blob);
      } else {
        // Try to download from Supabase Storage
        const blob = await downloadPhotoFromSupabase(photoId);
        resolve(blob);
      }
    };
  });
}

async function downloadPhotoFromSupabase(path: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(path);
  if (error) {
    console.error('Failed to download photo from Supabase:', error);
    return null;
  }
  // Cache in IndexedDB for offline access next time
  if (data) {
    try {
      const database = await openDB();
      return new Promise((resolve) => {
        const tx = database.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const metadata: PhotoMetadata = {
          id: path,
          assessmentId: path.split('/')[0],
          jobId: path.split('/')[1],
          photoKey: path.split('/')[2],
          timestamp: Date.now(),
          blob: data,
        };
        store.put(metadata);
        resolve(data);
      });
    } catch {
      return data;
    }
  }
  return null;
}

export async function deletePhoto(photoId: string): Promise<void> {
  // Delete from IndexedDB
  const database = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(photoId);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });

  // Delete from Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([photoId]);
  if (error) console.error('Failed to delete photo from Supabase:', error);
}

export async function deleteAssessmentPhotos(assessmentId: string): Promise<void> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const idx = store.index('assessmentId');
    const req = idx.openCursor(IDBKeyRange.only(assessmentId));

    const photoIds: string[] = [];

    req.onerror = () => reject(req.error);
    req.onsuccess = async (e) => {
      const cursor = (e.target as IDBRequest).result;
      if (cursor) {
        photoIds.push(cursor.value.id);
        cursor.delete();
        cursor.continue();
      } else {
        // Delete all from Supabase Storage in background
        if (photoIds.length > 0) {
          const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(photoIds);
          if (error) console.error('Failed to delete assessment photos from Supabase:', error);
        }
        resolve();
      }
    };
  });
}

export async function getPhotoUrl(photoId: string): Promise<string | null> {
  // Check IndexedDB first
  const blob = await getPhoto(photoId);
  if (blob) return URL.createObjectURL(blob);

  // Fall back to Supabase Storage public URL
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(photoId);
  return data?.publicUrl || null;
}
