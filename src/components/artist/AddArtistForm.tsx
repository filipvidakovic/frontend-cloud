import React, { useState } from "react";
import ArtistService from "../../services/ArtistService";

const AddArtistForm: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setResponse] = useState<any>(null);
  const [, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !age) {
      setError("First name, last name, and age are required.");
      return;
    }

    const artist = {
      name: firstName,
      lastname: lastName,
      age: parseInt(age, 10),
      bio: bio || "",
      genres: genres ? genres.split(",").map((g) => g.trim()) : [],
    };

    setLoading(true);
    setError(null);
    try {
      const result = await ArtistService.addArtist(artist);
      setResponse(result);
      window.alert(`🎉 Artist ${firstName} ${lastName} added successfully!`);
      setFirstName("");
      setLastName("");
      setAge("");
      setBio("");
      setGenres("");
    } catch (err: any) {
      console.error("Error submitting artist:", err);
      setError(err.message || "Failed to add artist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page container mt-5">
      <h1 className="display-4 mb-3 text-center">Add New Artist</h1>
      <p className="lead text-center mb-4">
        Fill in the required fields to add a new artist 🎤
      </p>

      <form
        onSubmit={handleSubmit}
        className="mx-auto"
        style={{ maxWidth: "600px" }}
      >
        <div className="mb-3">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Age</label>
          <input
            type="number"
            className="form-control"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Bio (optional)</label>
          <textarea
            className="form-control"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Genres (optional, comma-separated)
          </label>
          <input
            type="text"
            className="form-control"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Artist"}
        </button>
      </form>
    </div>
  );
};

export default AddArtistForm;
