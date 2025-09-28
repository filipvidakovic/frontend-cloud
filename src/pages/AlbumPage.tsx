// src/pages/AlbumPage.tsx (or AlbumDetailPage.tsx)
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./AlbumPage.css";
import SongCard from "../components/song/SongCard";
import MusicService from "../services/MusicService";
import type { Song } from "../models/Song";

type AlbumState = { genre?: string; musicIds?: string[] };

export default function AlbumDetailPage() {
  const { albumId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as { state?: AlbumState };

  // Resolve genre + ids from router state, with sessionStorage fallback
  const { resolvedGenre, resolvedIds } = useMemo(() => {
    let g = location.state?.genre;
    let ids = location.state?.musicIds;

    if ((!g || !ids?.length) && albumId) {
      try {
        const cached = JSON.parse(
          sessionStorage.getItem(`album:${albumId}`) || "null"
        );
        if (cached) {
          g ??= cached.genre;
          ids ??= cached.musicIds;
        }
      } catch {
        /* ignore */
      }
    }
    return { resolvedGenre: g || "", resolvedIds: ids ?? [] };
  }, [albumId, location.state]);

  // Keep ids in state so we can remove on deletion
  const [musicIds, setMusicIds] = useState<string[]>(resolvedIds);
  useEffect(() => {
    setMusicIds(resolvedIds);
  }, [albumId, resolvedIds]);

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const canFetch = useMemo(
    () => !!resolvedGenre && musicIds.length > 0,
    [resolvedGenre, musicIds]
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        if (!canFetch) {
          setSongs([]);
          return;
        }
        // IMPORTANT: use current musicIds state (not resolvedIds)
        const data = await MusicService.batchGetByIds(musicIds);
        setSongs(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load songs");
      } finally {
        setLoading(false);
      }
    })();
  }, [albumId, canFetch, resolvedGenre, musicIds]);

  // Remove from both songs[] and musicIds[]; keep sessionStorage in sync
  const handleDeleted = (removedId: string) => {
    setSongs((prev) => prev.filter((s) => s.musicId !== removedId));
    setMusicIds((prev) => {
      const next = prev.filter((id) => id !== removedId);
      try {
        sessionStorage.setItem(
          `album:${albumId}`,
          JSON.stringify({ genre: resolvedGenre, musicIds: next })
        );
      } catch {}
      return next;
    });
  };

  return (
    <div className="album-detail-container">
      <div className="album-detail-header">
        <div className="album-detail-header-left">
          <button className="album-detail-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h4 className="album-detail-title">
            Album: <span className="text-muted">{albumId}</span>
          </h4>
        </div>
        {resolvedGenre && (
          <span className="album-detail-genre-badge">{resolvedGenre}</span>
        )}
      </div>

      {loading && <div className="album-detail-message">Loading…</div>}
      {!loading && err && <div className="album-detail-message">{err}</div>}
      {!loading && !err && !canFetch && (
        <div className="album-detail-message">
          Missing album data. Try navigating from the Albums page.
        </div>
      )}
      {!loading && !err && canFetch && songs.length === 0 && (
        <div className="album-detail-message">No songs found for this album.</div>
      )}

      {!loading && !err && songs.length > 0 && (
        <div className="album-detail-songs">
          {songs.map((s) => (
            <SongCard
              key={s.musicId}
              musicId={s.musicId}
              title={s.title}
              // Use the album’s resolved genre (consistent with album browse)
              genre={resolvedGenre}
              album={s.albumId ?? undefined}
              fileUrl={s.fileUrl ?? ""}
              coverUrl={s.coverUrl}
              initialRate={s.rate ?? null} // rate now included from backend
              onDeleted={handleDeleted}  // keep UI in sync after delete
            />
          ))}
        </div>
      )}
    </div>
  );
}
