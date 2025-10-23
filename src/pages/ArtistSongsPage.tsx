import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./ArtistSongsPage.css";
import SongCard from "../components/song/SongCard";
import MusicService from "../services/MusicService";
import type { Song } from "../models/Song";

type LocationState = { artistName?: string; genres?: string[] };

export default function ArtistSongsPage() {
  const { artistId = "" } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: LocationState };

  const artistName = useMemo(
    () => location.state?.artistName || "Unknown Artist",
    [location.state?.artistName]
  );

  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // load songs for artist
  useEffect(() => {
    (async () => {
      if (!artistId) {
        setErr("Missing artist ID.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErr(null);
        const data = await MusicService.getSongsByArtistId(artistId);
        setSongs(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("Error fetching artist songs:", e);
        setErr(e?.message || `Failed to load songs for artist ${artistName}.`);
      } finally {
        setLoading(false);
      }
    })();
  }, [artistId, artistName]);

  // transcription (optional, like Album page)
  useEffect(() => {
    if (!activeSongId) return;
    (async () => {
      try {
        setLoadingTranscript(true);
        setTranscription(null);
        const res = await MusicService.getTranscription(activeSongId);
        setTranscription(res?.transcription || "No transcription available.");
      } catch {
        setTranscription("Failed to load transcription.");
      } finally {
        setLoadingTranscript(false);
      }
    })();
  }, [activeSongId]);

  // remove locally after deletion
  const handleDeleted = (removedId: string) => {
    setSongs((prev) => prev.filter((s) => s.musicId !== removedId));
    if (removedId === activeSongId) setActiveSongId(null);
  };

  return (
    <div className="artist-detail-container">
      <div className="artist-detail-header">
        <div className="artist-detail-header-left">
          <button className="artist-detail-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h4 className="artist-detail-title">
            Artist:&nbsp;<span className="text-muted">{artistName}</span>
          </h4>
        </div>

        {!!location.state?.genres?.length && (
          <div className="artist-detail-genres">
            {location.state.genres.map((g, i) => (
              <span key={i} className="artist-detail-genre-badge">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="artist-detail-message">Loading…</div>}
      {!loading && err && <div className="artist-detail-message">{err}</div>}
      {!loading && !err && songs.length === 0 && (
        <div className="artist-detail-message">No songs found for this artist.</div>
      )}

      {!loading && !err && songs.length > 0 && (
        <div className="artist-detail-songs">
          {songs.map((s) => (
            <SongCard
              key={s.musicId}
              musicId={s.musicId}
              title={s.title}
              genres={s.genres ?? []}
              album={s.albumId ?? undefined}
              fileUrl={s.fileUrl ?? ""}
              coverUrl={s.coverUrl}
              initialRate={s.rate ?? null}
              onDeleted={handleDeleted}
              onPlaySelected={setActiveSongId}
              // onUpdated not required, but you can add it if your SongCard supports inline edits
            />
          ))}
        </div>
      )}

      <div className="artist-detail-transcription">
        <h5>Transcription</h5>
        {!activeSongId && <p>Select a song to see transcription.</p>}
        {activeSongId && loadingTranscript && <p>Loading transcription…</p>}
        {activeSongId && !loadingTranscript && (
          <pre className="transcription-text">{transcription}</pre>
        )}
      </div>
    </div>
  );
}
