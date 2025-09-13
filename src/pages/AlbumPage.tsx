import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import MusicService from "../services/MusicService";
import type { Song } from "../models/Song";
import "./AlbumPage.css";
import SongCard from "../components/song/SongCard";

type AlbumState = { genre?: string; musicIds?: string[] };

export default function AlbumDetailPage() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as { state?: AlbumState };

  const { resolvedGenre, resolvedIds } = useMemo(() => {
    let g = location.state?.genre;
    let ids = location.state?.musicIds;

    if ((!g || !ids?.length) && albumId) {
      try {
        const cached = JSON.parse(sessionStorage.getItem(`album:${albumId}`) || "null");
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

  console.log("AlbumDetailPage resolved:", { albumId, genre: resolvedGenre, ids: resolvedIds });

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const canFetch = useMemo(
    () => !!resolvedGenre && resolvedIds.length > 0,
    [resolvedGenre, resolvedIds]
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
        const data = await MusicService.batchGetByGenre(resolvedGenre, resolvedIds);
        setSongs(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load songs");
      } finally {
        setLoading(false);
      }
    })();
  }, [albumId, canFetch, resolvedGenre, resolvedIds]);

  return (
    <div className="album-detail-container">
      <div className="album-detail-header">
        <div className="album-detail-header-left">
          <button className="album-detail-back" onClick={() => navigate(-1)}>← Back</button>
          <h4 className="album-detail-title">
            Album: <span className="text-muted">{albumId}</span>
          </h4>
        </div>
        {resolvedGenre && <span className="album-detail-genre-badge">{resolvedGenre}</span>}
      </div>

      {loading && <div className="album-detail-message">Loading…</div>}
      {!loading && err && <div className="album-detail-message">{err}</div>}
      {!loading && !err && !canFetch && (
        <div className="album-detail-message">Missing album data. Try navigating from the Albums page.</div>
      )}
      {!loading && !err && canFetch && songs.length === 0 && (
        <div className="album-detail-message">No songs found for this album.</div>
      )}

      {!loading && !err && songs.length > 0 && (
        <div className="album-detail-songs">
          {songs.map((s) => (
            <SongCard
              key={s.musicId}
              title={s.title}
              genre={s.genre}
              album={s.albumId ?? undefined}
              fileUrl={s.fileUrl ?? ""}
              coverUrl={s.coverUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
