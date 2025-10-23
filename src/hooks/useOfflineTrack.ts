// src/hooks/useOfflineTrack.ts
import { useEffect, useRef, useState } from "react";
import { fetchAndCacheTrack, toBlobUrl, removeCachedTrack } from "../services/OfflineAudio";
import MusicService from "../services/MusicService";

type State = { url: string; cached: boolean; loading: boolean; error: string | null };

export function useOfflineTrack(musicId: string, networkUrl?: string) {
  const [state, setState] = useState<State>({
    url: networkUrl || "",
    cached: false,
    loading: false,
    error: null
  });
  const revokeRef = useRef<(() => void) | null>(null);

  // On mount / when ids change, try to use local cache; else show network url
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const local = await toBlobUrl(musicId);
        if (cancelled) return;
        if (local) {
          revokeRef.current?.();
          revokeRef.current = local.revoke;
          setState({ url: local.url, cached: true, loading: false, error: null });
        } else {
          setState({ url: networkUrl || "", cached: false, loading: false, error: null });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState((s) => ({ ...s, error: e?.message || "Init failed" }));
        }
      }
    })();
    return () => { cancelled = true; revokeRef.current?.(); revokeRef.current = null; };
  }, [musicId, networkUrl]);

  // ALWAYS fetch a fresh presigned S3 URL from backend before caching
  const makeAvailable = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const signed = await MusicService.getSignedGetUrl(musicId); // <-- force backend call
      if (!signed) throw new Error("No signed URL available");
      await fetchAndCacheTrack(musicId, signed); // <-- must use native fetch inside
      const local = await toBlobUrl(musicId);
      if (!local) throw new Error("Cache load failed");
      revokeRef.current?.();
      revokeRef.current = local.revoke;
      setState({ url: local.url, cached: true, loading: false, error: null });
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e?.message || "Cache failed" }));
      throw e;
    }
  };

  const removeAvailable = async () => {
    await removeCachedTrack(musicId);
    revokeRef.current?.();
    revokeRef.current = null;
    setState({ url: networkUrl || "", cached: false, loading: false, error: null });
  };

  return { ...state, makeAvailable, removeAvailable };
}
