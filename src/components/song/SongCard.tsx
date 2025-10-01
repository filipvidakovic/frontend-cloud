// src/components/song/SongCard.tsx
import { useEffect, useRef, useState } from "react";
import placeholderCover from "../../assets/album.png";
import "./SongCard.css";
import UserService from "../../services/UserService";
import RateService from "../../services/RateService";
import { toast } from "react-toastify";
import MusicService, { type EditMusicPayload } from "../../services/MusicService";

export interface SongCardProps {
  musicId: string;
  title: string;
  genre: string;
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
  genre,
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
  const [localFileUrl] = useState(fileUrl);

  const [playing, setPlaying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rate, setRate] = useState<"love" | "like" | "dislike" | null>(initialRate);
  const [editOpen, setEditOpen] = useState(false);

  // browser-cache indicator (best-effort)
  const [preloaded, setPreloaded] = useState<boolean>(false);

  // ---- Helpers to detect "fully buffered" (best-effort) ----
  const computePreloaded = (el: HTMLAudioElement | null) => {
    if (!el) return false;
    try {
      if (!isFinite(el.duration) || el.duration <= 0) return false;
      const ranges = el.buffered;
      if (!ranges || ranges.length === 0) return false;
      // find max end
      let end = 0;
      for (let i = 0; i < ranges.length; i++) {
        end = Math.max(end, ranges.end(i));
      }
      // consider it "preloaded" if we have (almost) the entire duration
      const epsilon = 0.5; // seconds tolerance
      return end >= el.duration - epsilon;
    } catch {
      return false;
    }
  };

  // Update the preloaded flag whenever media state changes
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

    // events that impact buffering/metadata
    el.addEventListener("loadedmetadata", update);
    el.addEventListener("progress", update);
    el.addEventListener("canplaythrough", update);
    el.addEventListener("emptied", () => setPreloaded(false));

    // play-state events
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    // initial snapshot
    update();
    setPlaying(!el.paused && !el.ended);

    return () => {
      el.removeEventListener("loadedmetadata", update);
      el.removeEventListener("progress", update);
      el.removeEventListener("canplaythrough", update);
      el.removeEventListener("emptied", () => setPreloaded(false));

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
    // Encourage caching
    el.preload = "auto";
    // Reload to start fetching now (without starting playback)
    el.load();
    toast.success('Song is being preloaded (browser cache) ✅');
  };

  // No real way to clear browser cache programmatically, so we just reset hint/UI.
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
      onDeleted?.(musicId); // let parent remove this card from the list
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
    if (updatedItem?.coverUrl) setLocalCoverUrl(updatedItem.coverUrl);
    closeEdit();
  };

  const disabled = !localFileUrl;
  const artistsLabel = artists.length ? artists.join(", ") : null;

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
            <span className="song-chip">🎧</span>
            <span className="song-ellipsis">
              {genre}
              {localAlbum ? ` · Album: ${localAlbum}` : ""}
            </span>
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

        {/* Right CTA rail: Play + Edit/Delete + Preload/Download */}
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
        <audio ref={audioRef} src={localFileUrl} preload="none" />
      </div>

      {editOpen && (
        <EditSongModal
          musicId={musicId}
          initialTitle={localTitle}
          initialAlbumId={localAlbum}
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
  onClose,
  onSaved,
}: {
  musicId: string;
  initialTitle: string;
  initialAlbumId: string | null;
  onClose: () => void;
  onSaved: (updatedItem: any) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [genresCsv, setGenresCsv] = useState(""); // leave blank to keep unchanged
  const [albumId, setAlbumId] = useState(initialAlbumId ?? "");
  const [clearAlbum, setClearAlbum] = useState(false);

  const [newAudio, setNewAudio] = useState<File | null>(null);
  const [newCover, setNewCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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

      // Only include fields that have changed
      if (title.trim() !== initialTitle) payload.title = title.trim();

      const parsedGenres = genresCsv
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);
      if (parsedGenres.length > 0) payload.genres = parsedGenres;

      if (clearAlbum) {
        payload.albumId = null;
      } else {
        const trimmed = albumId.trim();
        if (trimmed && trimmed !== (initialAlbumId ?? "")) {
          payload.albumId = trimmed;
        }
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

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h5 className="modal-title">Edit song</h5>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="form-label">Genres (comma-separated, leave blank to keep)</label>
          <input
            className="form-control"
            placeholder="rock, pop"
            value={genresCsv}
            onChange={(e) => setGenresCsv(e.target.value)}
          />

          <div className="row-flex">
            <div style={{ flex: 1 }}>
              <label className="form-label">Album ID (optional)</label>
              <input
                className="form-control"
                placeholder="Leave empty to keep"
                value={albumId}
                onChange={(e) => {
                  setAlbumId(e.target.value);
                  setClearAlbum(false);
                }}
                disabled={clearAlbum}
              />
            </div>
            <div className="checkbox-col">
              <label className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={clearAlbum}
                  onChange={(e) => setClearAlbum(e.target.checked)}
                />
                <span>Clear album</span>
              </label>
            </div>
          </div>

          <label className="form-label">Replace audio (optional)</label>
          <input
            type="file"
            accept="audio/*"
            className="form-control"
            onChange={(e) => setNewAudio(e.target.files?.[0] || null)}
          />

          <label className="form-label">Replace cover (optional)</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setNewCover(e.target.files?.[0] || null)}
          />

          {err && <div className="text-danger mt-2">{err}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn btn-light" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
