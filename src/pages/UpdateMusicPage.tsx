import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MusicService from "../services/MusicService";
import "./UpdateMusicPage.css";

const UpdateMusicPage: React.FC = () => {
  const { genre, musicId } = useParams();

  const [title, setTitle] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (err) => reject(err);
    });

  useEffect(() => {
    if (!genre || !musicId) return;

    MusicService.getMusicDetails(genre, musicId)
      .then((data) => {
        setTitle(data.title);
        setOriginalTitle(data.title);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [genre, musicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      if (!musicId) throw new Error("Missing music ID");

      const fileChanged = !!file;
      const coverChanged = !!cover;
      const titleChanged = title !== originalTitle;

      if (!fileChanged && !coverChanged && !titleChanged) {
        setError("No changes detected.");
        setLoading(false);
        return;
      }

      const fileContent = file ? await toBase64(file) : null;
      const coverImage = cover ? await toBase64(cover) : null;

      const payload = {
        musicId,
        title: titleChanged ? title : null,
        fileName: file ? file.name : null,
        fileContent: fileContent,
        coverImage: coverImage,
      };

      const result = await MusicService.updateMusic(payload);
      setMessage(result.message || "Music updated successfully");
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-page container mt-5">
      <h2 className="text-center mb-4">Update Music</h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: "600px" }}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New Audio File (optional)</label>
            <input
              type="file"
              accept="audio/*"
              className="form-control"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New Cover Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setCover(e.target.files?.[0] || null)}
            />
          </div>

          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Music"}
          </button>
        </form>
      )}

      {message && <p className="alert alert-success mt-3 text-center">{message}</p>}
      {error && <p className="alert alert-danger mt-3 text-center">{error}</p>}
    </div>
  );
};

export default UpdateMusicPage;
