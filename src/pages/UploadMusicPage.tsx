import React, { useState } from "react";
import axios from "axios";
import "./UploadMusicPage.css";
import MusicService from "../services/MusicService";

const API_URL = import.meta.env.VITE_API_URL;

type ArtistOption = {
  artistId: string;
  name: string;
};

const UploadMusicPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [genres, setGenres] = useState("");
  const [albumId, setAlbumId] = useState("");

  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // artist selection state
  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<ArtistOption[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(false);
  const [artistsError, setArtistsError] = useState<string | null>(null);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (err) => reject(err);
    });

  // NEW: fetch artists for each genre typed in the Genres input
  const fetchArtistsFromSongGenres = async () => {
    setArtistsError(null);

    // parse comma-separated genres from the song's Genres field
    const list = genres
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    if (list.length === 0) {
      setArtistsError("Please enter at least one genre, then click Find.");
      return;
    }

    try {
      setArtistsLoading(true);
      const token = localStorage.getItem("token");

      // call /artists?genre=<g> for each genre, merge & dedupe
      const requests = list.map((g) =>
        axios.get(`${API_URL}/artists`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          params: { genre: g },
        })
      );

      const results = await Promise.all(requests);
      const merged: ArtistOption[] = [];

      for (const r of results) {
        const raw = Array.isArray(r.data?.artists) ? r.data.artists : r.data;
        const normalized: ArtistOption[] = (raw || [])
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

      // dedupe by artistId
      const uniqueById = Array.from(
        new Map(merged.map((a) => [a.artistId, a])).values()
      );

      // (optional) sort by name
      uniqueById.sort((a, b) => a.name.localeCompare(b.name));

      setArtistOptions(uniqueById);
      setSelectedArtistId(""); // reset picker
    } catch (err: any) {
      setArtistsError(
        err?.response?.data?.error ||
          "Failed to load artists for the given genres."
      );
      setArtistOptions([]);
    } finally {
      setArtistsLoading(false);
    }
  };

  const handleAddArtist = () => {
    if (!selectedArtistId) return;
    const found = artistOptions.find((a) => a.artistId === selectedArtistId);
    if (!found) return;
    if (selectedArtists.some((a) => a.artistId === found.artistId)) return; // dedupe
    setSelectedArtists((prev) => [...prev, found]);
    setSelectedArtistId("");
  };

  const handleRemoveArtist = (id: string) => {
    setSelectedArtists((prev) => prev.filter((a) => a.artistId !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!file) return alert("Please select an audio file.");
  if (selectedArtists.length === 0)
    return alert("Please add at least one artist.");

  setLoading(true);
  setError(null);

  try {
    const fileContent = await toBase64(file);
    const coverImage = cover ? await toBase64(cover) : null;

    const payload = {
      title,
      fileName: file.name,
      fileContent,
      genres: genres.split(",").map((g) => g.trim()).filter(Boolean),
      artistIds: selectedArtists.map((a) => a.artistId),
      albumId: albumId || null,
      coverImage,
    };

    const data = await MusicService.uploadMusic(payload);
    setResponse(data);

    const titleShown = (data?.title ?? title).toString();
    const idShown = (data?.musicId ?? "").toString();
    const genresShown = Array.isArray(data?.genres) && data.genres.length
      ? data.genres.join(", ")
      : genres;

    window.alert(
      `🎉 Song uploaded!\n\n` +
      `Title: ${titleShown}\n` +
      `Genres: ${genresShown || "(none)"}`
    );


  } catch (err: any) {
    console.error("Upload error:", err);
    setError(err.message || "Upload failed. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="upload-page container mt-5">
      <h1 className="display-4 mb-3 text-center">Upload Music</h1>
      <p className="lead text-center mb-4">
        Fill in the details and upload your song to share it with the world! 🎵
      </p>

      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 600 }}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Audio File</label>
          <input
            type="file"
            accept="audio/*"
            className="form-control"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Cover Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setCover(e.target.files?.[0] || null)}
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
              required
            />
            {/* NEW: fetch artists from entered genres */}
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={fetchArtistsFromSongGenres}
              disabled={artistsLoading}
              title="Find artists matching the genres above"
            >
              {artistsLoading ? "Finding..." : "Find Artists"}
            </button>
          </div>
          {artistsError && (
            <small className="text-danger d-block mt-1">{artistsError}</small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Album ID (optional)</label>
          <input
            type="text"
            className="form-control"
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
          />
        </div>

        {/* Artist selector (populated after clicking Find Artists) */}
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

          {/* Selected artists as removable chips */}
          {selectedArtists.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2">
              {selectedArtists.map((a) => (
                <span
                  key={a.artistId}
                  className="badge text-bg-primary d-flex align-items-center"
                  style={{ gap: 6, padding: "0.5rem 0.6rem" }}
                >
                  {a.name}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-1"
                    aria-label="Remove"
                    onClick={() => handleRemoveArtist(a.artistId)}
                    style={{ transform: "scale(0.8)" }}
                  />
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? "Uploading..." : "Upload Song"}
        </button>
      </form>

      {error && <p className="text-danger text-center mt-3">{error}</p>}

      {response && (
        <div className="alert alert-success mt-4">
          {response.message || "Song uploaded successfully!"}
        </div>
      )}
    </div>
  );
};

export default UploadMusicPage;
