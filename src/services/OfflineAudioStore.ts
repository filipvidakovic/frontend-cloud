export type TrackRecord = {
  musicId: string;
  blob: Blob;
  mime: string;
  size: number;
  etag?: string | null;
  lastModified?: string | null;
  savedAt: number;
};

const DB_NAME = "music-offline";
const STORE = "tracks";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "musicId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const s = tx.objectStore(STORE);
    const r = fn(s);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export const OfflineAudioStore = {
  async put(rec: TrackRecord) {
    await withStore("readwrite", (s) => s.put(rec));
  },
  async get(musicId: string): Promise<TrackRecord | undefined> {
    return (await withStore("readonly", (s) => s.get(musicId))) as any;
  },
  async delete(musicId: string) {
    await withStore("readwrite", (s) => s.delete(musicId));
  },
  async listIds(): Promise<string[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const s = tx.objectStore(STORE);
      const req = s.getAllKeys();
      req.onsuccess = () => resolve((req.result as IDBValidKey[]).map(String));
      req.onerror = () => reject(req.error);
    });
  },
  async usage(): Promise<{ count: number; bytes: number }> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const s = tx.objectStore(STORE);
      const req = s.getAll();
      req.onsuccess = () => {
        const all = (req.result as TrackRecord[]) || [];
        resolve({
          count: all.length,
          bytes: all.reduce((sum, t) => sum + (t?.size || 0), 0),
        });
      };
      req.onerror = () => reject(req.error);
    });
  },
};
