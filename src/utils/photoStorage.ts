// IndexedDB photo storage for real camera captures
const DB_NAME = 'maximus-estimus-photos';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

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
  const photoId = `${jobId}-${photoKey}-${Date.now()}`;

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const metadata: PhotoMetadata = {
      id: photoId,
      assessmentId,
      jobId,
      photoKey,
      timestamp: Date.now(),
      blob,
    };

    const req = store.put(metadata);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(photoId);
  });
}

export async function getPhoto(photoId: string): Promise<Blob | null> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(photoId);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const metadata = req.result as PhotoMetadata | undefined;
      resolve(metadata?.blob || null);
    };
  });
}

export async function deletePhoto(photoId: string): Promise<void> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(photoId);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}

export async function deleteAssessmentPhotos(assessmentId: string): Promise<void> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const idx = store.index('assessmentId');
    const req = idx.openCursor(IDBKeyRange.only(assessmentId));

    req.onerror = () => reject(req.error);
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
  });
}

export async function getPhotoUrl(photoId: string): Promise<string | null> {
  const blob = await getPhoto(photoId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}
