import React, { useState } from "react";
import "./UploadMusicPage.css";

const UploadMusicPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [genres, setGenres] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select an audio file.");
    setLoading(true);
    setError(null);
    try {
      const fileContent = await toBase64(file);
      const coverImage = cover ? await toBase64(cover) : null;

      const payload = {
        title,
        fileName: file.name,
        fileContent,
        genres: genres.split(",").map((g) => g.trim()),
        artistIds: [], // Placeholder until artist selection is integrated
        albumName: albumName || null,
        coverImage,
      };

      const res = await fetch("<YOUR_API_GATEWAY_ENDPOINT>", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError("Upload failed. Please try again.");
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

      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: "600px" }}>
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
          <input
            type="text"
            className="form-control"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Album Name (optional)</label>
          <input
            type="text"
            className="form-control"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <button type="button" className="btn btn-outline-primary w-100">
            Select Artist
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Song"}
        </button>
      </form>

      {error && <p className="text-danger text-center mt-3">{error}</p>}

      {response && (
        <div className="alert alert-success mt-4">
          <pre className="mb-0">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadMusicPage;