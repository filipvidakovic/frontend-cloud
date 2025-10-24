// src/pages/UploadAlbumPage.tsx
import React, { useRef, useState } from "react";
import axios from "axios";
import "./UploadAlbumPage.css";
import MusicService from "../services/MusicService";

const API_URL = import.meta.env.VITE_API_URL;

type ArtistOption = { artistId: string; name: string };

const UploadAlbumPage: React.FC = () => {
  const [albumId, setAlbumId] = useState("");

  // modal open/close
  const [showModal, setShowModal] = useState(false);

  // modal form state
  const [title, setTitle] = useState("");
  const [genres, setGenres] = useState("");
  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<ArtistOption[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(false);
  const [artistsError, setArtistsError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // files
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(String(reader.result).split(",")[1]);
      reader.onerror = reject;
    });

  const openModal = () => {
    const id = albumId.trim();
    if (!id) {
      alert("Please enter an Album ID first.");
      return;
    }
    setShowModal(true);
  };


  const resetModalForm = () => {
    setTitle("");
    setGenres("");
    setArtistOptions([]);
    setSelectedArtistId("");
    setSelectedArtists([]);
    setErr(null);
    setAudioFile(null);
    setCoverFile(null);
    if (audioRef.current) audioRef.current.value = "";
    if (coverRef.current) coverRef.current.value = "";
  };

  const handleAddArtist = () => {
    if (!selectedArtistId) return;
    const found = artistOptions.find((a) => a.artistId === selectedArtistId);
    if (!found) return;
    if (selectedArtists.some((a) => a.artistId === found.artistId)) return;
    setSelectedArtists((prev) => [...prev, found]);
    setSelectedArtistId("");
  };

  const handleRemoveArtist = (id: string) => {
    setSelectedArtists((prev) => prev.filter((a) => a.artistId !== id));
  };

  const fetchArtistsFromGenres = async () => {
    setArtistsError(null);

    const list = genres
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    if (list.length === 0) {
      setArtistsError("Enter at least one genre, then click Find.");
      return;
    }

    try {
      setArtistsLoading(true);
      const token = localStorage.getItem("token");
      const reqs = list.map((g) =>
        axios.get(`${API_URL}/artists`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          params: { genre: g },
        })
      );

      const results = await Promise.all(reqs);
      const merged: ArtistOption[] = [];
      for (const r of results) {
        const arr = Array.isArray(r.data?.artists) ? r.data.artists : r.data;
        const normalized: ArtistOption[] = (arr || [])
          .map((a: any) => ({
            artistId: a.artistId ?? a.id ?? a.artist_id,
            name:
              a.name ??
              a.artistName ??
              a.stageName ??
              a.username ??
              "Unknown",
          }))
          .filter((a: { artistId: any; }) => !!a.artistId);
        merged.push(...normalized);
      }

      const unique = Array.from(
        new Map(merged.map((a) => [a.artistId, a])).values()
      ).sort((a, b) => a.name.localeCompare(b.name));

      setArtistOptions(unique);
      setSelectedArtistId("");
    } catch (e: any) {
      setArtistsError(
        e?.response?.data?.error || "Failed to load artists for these genres."
      );
      setArtistOptions([]);
    } finally {
      setArtistsLoading(false);
    }
  };

  const handleSubmitSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter a title.");
    if (!audioFile) return alert("Please choose an audio file.");
    if (selectedArtists.length === 0)
      return alert("Please add at least one artist.");

    setLoading(true);
    setErr(null);

    try {
      const fileContent = await toBase64(audioFile);
      const coverImage = coverFile ? await toBase64(coverFile) : null;

      const payload = {
        title: title.trim(),
        fileName: audioFile.name,
        fileContent,
        genres: genres.split(",").map((g) => g.trim()).filter(Boolean),
        artistIds: selectedArtists.map((a) => a.artistId),
        albumId: albumId.trim(),
        coverImage,
      };

      const data = await MusicService.uploadMusic(payload);

      window.alert(
        `🎉 Song uploaded to album ${albumId}!\n\n` +
          `Title: ${data?.title ?? payload.title}\n`
      );

      // partial reset to speed up adding multiple songs
      setTitle("");
      setAudioFile(null);
      if (audioRef.current) audioRef.current.value = "";
      setCoverFile(null);
      if (coverRef.current) coverRef.current.value = "";
      // keep genres & selectedArtists to add more tracks quickly

    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="album-upload container mt-5">
      <div className="card-soft">
        <h1 className="mb-3">Upload Album</h1>
        <p className="text-muted">
          Enter an <strong>Album ID</strong>, then click <em>Add Songs</em> to open an in-page modal uploader.
        </p>

        <label className="form-label">Album ID</label>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="album-123"
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
        />

        <button className="btn btn-primary" onClick={openModal}>
          Add Songs
        </button>
      </div>

      {/* Modal overlay */}
      {showModal && (
        <div
          aria-modal="true"
          role="dialog"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
          onClick={(e) => {
            // close when clicking backdrop only
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{
              width: "min(720px, 92vw)",
              maxHeight: "90vh",
              overflow: "auto",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 6px 24px rgba(0,0,0,.2)",
              padding: 18,
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h5 m-0">➕ Add a song to album</h2>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setShowModal(false);
                  resetModalForm();
                }}
              >
                Close
              </button>
            </div>

            <div className="mb-2 text-muted">
              <strong>Album ID:</strong> {albumId || "—"}
            </div>

            <form onSubmit={handleSubmitSong}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Song title"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Genres (comma-separated)</label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="rock, pop"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={fetchArtistsFromGenres}
                    disabled={artistsLoading}
                    title="Find artists matching the genres"
                  >
                    {artistsLoading ? "Finding..." : "Find Artists"}
                  </button>
                </div>
                {artistsError && (
                  <small className="text-danger d-block mt-1">
                    {artistsError}
                  </small>
                )}
              </div>

              {/* Artist selector */}
              <div className="mb-3">
                <label className="form-label">Artists</label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={selectedArtistId}
                    onChange={(e) => setSelectedArtistId(e.target.value)}
                    disabled={artistsLoading || artistOptions.length === 0}
                  >
                    <option value="">
                      {artistsLoading
                        ? "Loading artists..."
                        : artistOptions.length
                        ? "Select an artist..."
                        : "No artists loaded yet"}
                    </option>
                    {artistOptions.map((a) => (
                      <option key={a.artistId} value={a.artistId}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleAddArtist}
                    disabled={!selectedArtistId}
                    title="Add artist"
                  >
                    + Add
                  </button>
                </div>

                {/* chips */}
                {selectedArtists.length > 0 && (
                  <div className="artist-chips">
                    {selectedArtists.map((a) => (
                      <span key={a.artistId} className="artist-chip">
                        {a.name}
                        <button
                          type="button"
                          className="btn-close btn-close-white"
                          aria-label="Remove"
                          onClick={() => handleRemoveArtist(a.artistId)}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Audio File</label>
                <input
                  ref={audioRef}
                  type="file"
                  accept="audio/*"
                  className="form-control"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Cover Image (optional)</label>
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </div>

              {err && <p className="text-danger mb-2">{err}</p>}

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? "Uploading..." : "Upload Song"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetModalForm}
                  disabled={loading}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn btn-light ms-auto"
                  onClick={() => {
                    setShowModal(false);
                    resetModalForm();
                  }}
                  disabled={loading}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadAlbumPage;
