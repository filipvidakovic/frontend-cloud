// src/services/OfflineAudio.ts
import { OfflineAudioStore } from "./OfflineAudioStore";

export async function fetchAndCacheTrack(musicId: string, signedUrl: string): Promise<void> {
  // Minimal CORS-friendly fetch: no headers, no credentials
  const res = await fetch(signedUrl, {
    method: "GET",
  });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const etag = res.headers.get("ETag") || undefined;
  const lastModified = res.headers.get("Last-Modified") || undefined;
  const record: TrackRecord = {
      musicId: musicId, // ⬅️ Ključni put za IndexedDB
      blob: blob,
      mime: blob.type,
      size: blob.size,
      etag: etag,
      lastModified: lastModified,
      savedAt: Date.now(),
  };

  // Persist to IndexedDB (store mime for nicer downloads later)
  await OfflineAudioStore.put(record);

  // Optionally persist a small manifest (etag/last-modified) if you read exposed headers:
  // const etag = res.headers.get("ETag") || undefined;
  // await OfflineAudioStore.putMeta(musicId, { etag });
}

export async function toBlobUrl(musicId: string) {
  const rec = await OfflineAudioStore.get(musicId);
  if (!rec?.blob) return null;
  const url = URL.createObjectURL(rec.blob);
  const revoke = () => URL.revokeObjectURL(url);
  return { url, revoke };
}

export async function removeCachedTrack(musicId: string) {
  await OfflineAudioStore.delete(musicId);
}
