import React, { useMemo, useState } from "react";
import MusicService, { type EditMusicPayload } from "../../services/MusicService";
import "./EditSongModal.css";

type EditSongModalProps = {
  open: boolean;
  onClose: () => void;
  // minimal data needed to prefill the form
  song: {
    musicId: string;
    title: string;
    coverUrl?: string | null;
    albumId?: string | null;
    genres?: string[];
    artistIds?: string[];
  };
  onUpdated?: (updated: { musicId: string; title?: string; coverUrl?: string | null; albumId?: string | null; genres?: string[]; artistIds?: string[] }) => void;
};

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = reject;
  });

export default function EditSongModal({
  open,
  onClose,
  song,
  onUpdated,
}: EditSongModalProps) {
  const initial = useMemo(() => ({
    title: song.title || "",
    genres: (song.genres || []).join(", "),
    albumId: song.albumId || "",
    artistIds: (song.artistIds || []).join(","),
  }), [song]);

  const [title, setTitle] = useState(initial.title);
  const [genres, setGenres] = useState(initial.genres);
  const [albumId, setAlbumId] = useState(initial.albumId);
  const [artistIds, setArtistIds] = useState(initial.artistIds);
  const [newAudio, setNewAudio] = useState<File | null>(null);
  const [newCover, setNewCover] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reset form when a different song is opened
  React.useEffect(() => {
    setTitle(initial.title);
    setGenres(initial.genres);
    setAlbumId(initial.albumId);
    setArtistIds(initial.artistIds);
    setNewAudio(null);
    setNewCover(null);
    setErr(null);
    setSaving(false);
  }, [initial, open]);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErr(null);

      const payload: EditMusicPayload = { musicId: song.musicId };

      // include only changed fields
      if (title !== initial.title) payload.title = title;

      const parsedGenres = genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);
      if (parsedGenres.join(",") !== (song.genres || []).join(",")) {
        payload.genres = parsedGenres;
      }

      const parsedArtistIds = artistIds
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      if (parsedArtistIds.join(",") !== (song.artistIds || []).join(",")) {
        payload.artistIds = parsedArtistIds;
      }

      // Album: send if changed; allow clearing via empty string -> null
      const normalizedAlbum = albumId.trim() === "" ? null : albumId.trim();
      const currentAlbum = song.albumId ?? null;
      if (normalizedAlbum !== currentAlbum) {
        payload.albumId = normalizedAlbum; // null clears albumId
      }

      if (newAudio) {
        payload.fileName = newAudio.name;        // required when sending fileContent
        payload.fileContent = await toBase64(newAudio);
      }
      if (newCover) {
        payload.coverImage = await toBase64(newCover);
      }

      const res = await MusicService.updateMusic(payload);
      // prefer updatedItem from lambda; fallback to our changed fields
      const updated = res?.updatedItem ?? {
        musicId: song.musicId,
        title: payload.title ?? song.title,
        coverUrl: song.coverUrl ? "(updated)" : song.coverUrl,
        albumId: payload.albumId ?? song.albumId ?? null,
        genres: payload.genres ?? song.genres ?? [],
        artistIds: payload.artistIds ?? song.artistIds ?? [],
      };

      onUpdated?.({
        musicId: updated.musicId,
        title: updated.title,
        coverUrl: updated.coverUrl,
        albumId: updated.albumId ?? null,
        genres: updated.genres,
        artistIds: updated.artistIds,
      });

      onClose();
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-modal-overlay" role="dialog" aria-modal="true">
      <div className="edit-modal">
        <div className="edit-modal-header">
          <h5>Edit Song</h5>
          <button className="edit-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={onSubmit} className="edit-modal-body">
          <div className="mb-2">
            <label className="form-label">Title</label>
            <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="mb-2">
            <label className="form-label">Genres (comma-separated)</label>
            <input className="form-control" value={genres} onChange={(e) => setGenres(e.target.value)} />
          </div>

          <div className="mb-2">
            <label className="form-label">Artist IDs (comma-separated)</label>
            <input className="form-control" value={artistIds} onChange={(e) => setArtistIds(e.target.value)} />
          </div>

          <div className="mb-2">
            <label className="form-label">Album ID (leave blank to clear)</label>
            <input className="form-control" value={albumId} onChange={(e) => setAlbumId(e.target.value)} />
          </div>

          <div className="mb-2">
            <label className="form-label">Replace Audio (optional)</label>
            <input type="file" accept="audio/*" className="form-control" onChange={(e) => setNewAudio(e.target.files?.[0] || null)} />
          </div>

          <div className="mb-2">
            <label className="form-label">Replace Cover (optional)</label>
            <input type="file" accept="image/*" className="form-control" onChange={(e) => setNewCover(e.target.files?.[0] || null)} />
          </div>

          {err && <div className="text-danger small mb-2">{err}</div>}

          <div className="edit-modal-footer">
            <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
