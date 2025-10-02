// src/components/song/SongCard.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import placeholderCover from "../../assets/album.png";
import "./SongCard.css";
import UserService from "../../services/UserService";
import RateService from "../../services/RateService";
import { toast } from "react-toastify";
import MusicService, { type EditMusicPayload } from "../../services/MusicService";

export interface SongCardProps {
  musicId: string;
  title: string;
  genres: string[];                 // current song genres (array)
  album?: string | null;
  fileUrl: string;
  coverUrl?: string | null;
  artists?: string[];
  initialRate?: "love" | "like" | "dislike" | null;
  onDeleted?: (musicId: string) => void; // notify parent after delete
  onPlaySelected?: (musicId: string) => void;
}

export default function SongCard({
  musicId,
  title,
  genres,
  album,
  fileUrl,
  coverUrl,
  artists = [],
  initialRate = null,
  onDeleted,
  onPlaySelected,
}: SongCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // local state so the card can reflect updates without reloading the list
  const [localTitle, setLocalTitle] = useState(title);
  const [localAlbum, setLocalAlbum] = useState<string | null>(album ?? null);
  const [localCoverUrl, setLocalCoverUrl] = useState<string | null>(coverUrl ?? null);
  const [localFileUrl, setLocalFileUrl] = useState(fileUrl); // <-- make this mutable
  const [localGenres, setLocalGenres] = useState<string[]>(genres ?? []);

  const [playing, setPlaying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rate, setRate] = useState<"love" | "like" | "dislike" | null>(initialRate);
  const [editOpen, setEditOpen] = useState(false);

  // browser-cache indicator (best-effort)
  const [preloaded, setPreloaded] = useState<boolean>(false);

  // keep in sync if parent updates props later
  useEffect(() => setLocalGenres(genres ?? []), [genres]);
  useEffect(() => setLocalCoverUrl(coverUrl ?? null), [coverUrl]);
  useEffect(() => setLocalTitle(title), [title]);
  useEffect(() => setLocalAlbum(album ?? null), [album]);
  useEffect(() => setLocalFileUrl(fileUrl), [fileUrl]);

  // ---- Helpers to detect "fully buffered" (best-effort) ----
  const computePreloaded = (el: HTMLAudioElement | null) => {
    if (!el) return false;
    try {
      if (!isFinite(el.duration) || el.duration <= 0) return false;
      const ranges = el.buffered;
      if (!ranges || ranges.length === 0) return false;
      let end = 0;
      for (let i = 0; i < ranges.length; i++) end = Math.max(end, ranges.end(i));
      const epsilon = 0.5; // seconds tolerance
      return end >= el.duration - epsilon;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const update = () => setPreloaded(computePreloaded(el));
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onError = () => {
      console.error("Audio error", el.error, { src: el.currentSrc });
      setPlaying(false);
    };

    el.addEventListener("loadedmetadata", update);
    el.addEventListener("progress", update);
    el.addEventListener("canplaythrough", update);
    const onEmptied = () => setPreloaded(false);
    el.addEventListener("emptied", onEmptied);

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    update();
    setPlaying(!el.paused && !el.ended);

    return () => {
      el.removeEventListener("loadedmetadata", update);
      el.removeEventListener("progress", update);
      el.removeEventListener("canplaythrough", update);
      el.removeEventListener("emptied", onEmptied);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [localFileUrl]);

  // Play/pause
  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      if (el.paused) {
        await el.play();
        setPlaying(true);
        onPlaySelected?.(musicId);
        try {
          await UserService.recordListening(genre);
        } catch (err) {
          console.error("Failed to record listening:", err);
        }
      } else {
        el.pause();
      }
    } catch (err) {
      console.error("Audio play failed:", err, { src: el?.currentSrc });
      setPlaying(false);
    }
  };

  // "Make available" = tell the browser to fetch & keep the media in its own cache
  const handleMakeAvailableOffline = () => {
    const el = audioRef.current;
    if (!el) return;
    el.preload = "auto";
    el.load(); // start fetching
    toast.success("Song is being preloaded (browser cache) ✅");
  };

  const handleRemoveOffline = () => {
    const el = audioRef.current;
    if (el) {
      el.preload = "none";
      el.load();
    }
    setPreloaded(false);
    toast.info("Preload hint cleared (browser may still keep the file).");
  };

  // Download via MusicService (302 to S3)
  const handleDownload = async () => {
    try {
      await MusicService.downloadMusic(musicId);
      toast.success("Download started 💾");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Download failed");
    }
  };

  // Reactions
  const handleRate = async (newRate: "love" | "like" | "dislike") => {
    try {
      if (rate === newRate) {
        await RateService.deleteRate(musicId);
        setRate(null);
        toast.success("Rate removed ✅");
      } else {
        await RateService.setRate(musicId, newRate);
        setRate(newRate);
        toast.success(`You rated: ${newRate} ✅`);
      }
    } catch (err) {
      console.error("Failed to update rate:", err);
      toast.error("Failed to update rate");
    }
  };

  // Delete
  const handleDelete = async () => {
    if (deleting) return;
    const ok = window.confirm(`Delete this song?\n\n${localTitle}`);
    if (!ok) return;
    try {
      setDeleting(true);
      await MusicService.deleteMusic(musicId);
      onDeleted?.(musicId);
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // Edit modal open/close
  const openEdit = () => setEditOpen(true);
  const closeEdit = () => setEditOpen(false);

  // After successful save in modal
  const onSaved = (updatedItem: any) => {
  if (updatedItem?.title) setLocalTitle(updatedItem.title);
  if ("albumId" in updatedItem) setLocalAlbum(updatedItem.albumId ?? null);
  if (updatedItem?.coverUrlSigned) setLocalCoverUrl(updatedItem.coverUrlSigned);
  if (updatedItem?.genres) setLocalGenres(updatedItem.genres);

  // 🔑 use signed URL if returned
  if (updatedItem?.fileUrlSigned) {
    setLocalFileUrl(updatedItem.fileUrlSigned);
  }

  closeEdit();
};

  const disabled = !localFileUrl;
  const artistsLabel = artists.length ? artists.join(", ") : null;

  // render up to 3 genre badges, +more if needed
  const genreBadges = useMemo(() => {
    const list = localGenres || [];
    const shown = list.slice(0, 3);
    const rest = list.length - shown.length;
    return { shown, rest };
  }, [localGenres]);

  return (
    <>
      <div className={`song-card ${playing ? "playing" : ""}`}>
        {/* Cover */}
        <img
          src={localCoverUrl || placeholderCover}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = placeholderCover;
          }}
          alt={`${localTitle} cover`}
          className="song-card-cover"
        />

        {/* Content */}
        <div className="song-card-content">
          <h6 className="song-card-title">
            {localTitle}{" "}
            {preloaded && <span className="song-chip" title="Likely cached in browser">📦</span>}
          </h6>

          {artistsLabel && (
            <div className="song-card-line song-card-artists" title={artistsLabel}>
              <span className="song-chip">🎤</span>
              <span className="song-ellipsis">{artistsLabel}</span>
            </div>
          )}

          <div className="song-card-line song-card-meta">
            <span className="song-chip">🏷️</span>
            <div className="genre-badges" title={localGenres.join(", ")}>
              {genreBadges.shown.map((g) => (
                <span className="genre-badge" key={g}>{g}</span>
              ))}
              {genreBadges.rest > 0 && <span className="genre-badge genre-badge-muted">+{genreBadges.rest}</span>}
              {localAlbum && <span className="meta-dot">•</span>}
              {localAlbum && <span className="album-label">Album: {localAlbum}</span>}
            </div>
          </div>
        </div>

        {/* Reactions */}
        <div className="song-card-reactions">
          <button
            type="button"
            className={`reaction-btn ${rate === "love" ? "active" : ""}`}
            onClick={() => handleRate("love")}
            title="Love"
          >
            ❤️
          </button>
          <button
            type="button"
            className={`reaction-btn ${rate === "like" ? "active" : ""}`}
            onClick={() => handleRate("like")}
            title="Like"
          >
            👍
          </button>
          <button
            type="button"
            className={`reaction-btn ${rate === "dislike" ? "active" : ""}`}
            onClick={() => handleRate("dislike")}
            title="Dislike"
          >
            👎
          </button>
        </div>

        {/* Right CTA rail */}
        <div className="song-card-cta">
          <button
            type="button"
            className={`song-card-play-btn ${playing ? "pause" : ""}`}
            onClick={togglePlay}
            disabled={disabled}
            aria-pressed={playing}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? "⏸" : "▶️"}
          </button>

          <div className="song-card-actions" aria-label="Song actions">
            <button
              type="button"
              className="song-action-btn"
              onClick={handleDownload}
              title="Download file"
            >
              ⬇️
            </button>

            {preloaded ? (
              <button
                type="button"
                className="song-action-btn"
                onClick={handleRemoveOffline}
                title="Reset preload hint"
              >
                🗑️📦
              </button>
            ) : (
              <button
                type="button"
                className="song-action-btn"
                onClick={handleMakeAvailableOffline}
                title='Make available "offline" (browser cache)'
              >
                📥
              </button>
            )}

            <button
              type="button"
              className="song-action-btn"
              onClick={openEdit}
              title="Edit song"
            >
              ✏️
            </button>
            <button
              type="button"
              className="song-action-btn danger"
              onClick={handleDelete}
              disabled={deleting}
              title={deleting ? "Deleting…" : "Delete song"}
            >
              {deleting ? "…" : "🗑️"}
            </button>
          </div>
        </div>

        {/* Single audio element (browser cache only) */}
        <audio key={localFileUrl} ref={audioRef} src={localFileUrl} preload="none" />
      </div>

      {editOpen && (
        <EditSongModal
          musicId={musicId}
          initialTitle={localTitle}
          initialAlbumId={localAlbum}
          initialGenres={localGenres}
          onClose={closeEdit}
          onSaved={onSaved}
        />
      )}
    </>
  );
}

/* ---------- Modal component (inline, no external libs) ---------- */

function EditSongModal({
  musicId,
  initialTitle,
  initialAlbumId,
  initialGenres,
  onClose,
  onSaved,
}: {
  musicId: string;
  initialTitle: string;
  initialAlbumId: string | null;
  initialGenres: string[];
  onClose: () => void;
  onSaved: (updatedItem: any) => void;
}) {
  const [title, setTitle] = useState(initialTitle);

  // Genres: free-text CSV, prefilled with current genres
  const [genresCsv, setGenresCsv] = useState((initialGenres ?? []).join(", "));
  const [albumId, setAlbumId] = useState(initialAlbumId ?? "");
  const [clearAlbum, setClearAlbum] = useState(false);

  const [newAudio, setNewAudio] = useState<File | null>(null);
  const [newCover, setNewCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const normalize = (arr: string[]) =>
    Array.from(new Set(arr.map(g => g.trim()).filter(Boolean)));

  const deepEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const A = [...a].sort();
    const B = [...b].sort();
    return A.every((v, i) => v === B[i]);
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => resolve(String(r.result).split(",")[1]);
      r.onerror = reject;
    });

  const handleSave = async () => {
    try {
      setSaving(true);
      setErr(null);

      const payload: EditMusicPayload = { musicId };

      if (title.trim() !== initialTitle) payload.title = title.trim();

      // Parse genres CSV and send only if changed
      const parsedGenres = normalize(genresCsv.split(","));
      if (!deepEqual(parsedGenres, initialGenres ?? [])) {
        payload.genres = parsedGenres;
      }

      if (clearAlbum) {
        payload.albumId = null;
      } else {
        const trimmed = albumId.trim();
        if (trimmed && trimmed !== (initialAlbumId ?? "")) payload.albumId = trimmed;
      }

      if (newAudio) {
        payload.fileName = newAudio.name;
        payload.fileContent = await toBase64(newAudio);
      }

      if (newCover) {
        payload.coverImage = await toBase64(newCover);
      }

      const res = await MusicService.updateMusic(payload);
      const updatedItem = res?.updatedItem ?? {};
      onSaved(updatedItem);
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="se-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={onBackdrop}
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      <div className="se-modal" role="document">
        <div className="se-modal__header">
          <h5 className="se-modal__title">Edit song</h5>
          <button className="se-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="se-modal__body">
          <div className="se-form-field">
            <label className="se-form-label" htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              className="se-form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Genres: free text, prefilled */}
          <div className="se-form-field">
            <label className="se-form-label" htmlFor="edit-genres">
              Genres (comma-separated)
            </label>
            <input
              id="edit-genres"
              className="se-form-control"
              placeholder="rock, pop"
              value={genresCsv}
              onChange={(e) => setGenresCsv(e.target.value)}
            />
          </div>

          <div className="se-row">
            <div className="se-form-field se-flex-1">
              <label className="se-form-label" htmlFor="edit-album">Album ID (optional)</label>
              <input
                id="edit-album"
                className="se-form-control"
                placeholder="Leave empty to keep"
                value={albumId}
                onChange={(e) => {
                  setAlbumId(e.target.value);
                  setClearAlbum(false);
                }}
                disabled={clearAlbum}
              />
            </div>
            <div className="se-checkbox-col">
              <label className="se-form-check">
                <input
                  type="checkbox"
                  className="se-form-check-input"
                  checked={clearAlbum}
                  onChange={(e) => setClearAlbum(e.target.checked)}
                />
                <span>Clear album</span>
              </label>
            </div>
          </div>

          <div className="se-form-field">
            <label className="se-form-label" htmlFor="edit-audio">Replace audio (optional)</label>
            <input
              id="edit-audio"
              type="file"
              accept="audio/*"
              className="se-form-control"
              onChange={(e) => setNewAudio(e.target.files?.[0] || null)}
            />
          </div>

          <div className="se-form-field">
            <label className="se-form-label" htmlFor="edit-cover">Replace cover (optional)</label>
            <input
              id="edit-cover"
              type="file"
              accept="image/*"
              className="se-form-control"
              onChange={(e) => setNewCover(e.target.files?.[0] || null)}
            />
          </div>

          {err && <div className="se-text-danger se-mt-2">{err}</div>}
        </div>

        <div className="se-modal__footer">
          <button className="se-btn se-btn-light" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="se-btn se-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
