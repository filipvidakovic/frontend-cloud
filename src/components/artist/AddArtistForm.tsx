import { useState } from "react";

export default function AddArtistForm() {
    const onSubmit = (artist: {
    firstName: string;
    lastName: string;
    age: number;
    bio: string;
    genres: string[];
  }) => {
    console.log("New artist added:", artist);
    alert(`Artist ${artist.firstName} ${artist.lastName} added!`);
  };
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [genreInput, setGenreInput] = useState("");
  const [genres, setGenres] = useState<string[]>([]);

  const handleAddGenre = () => {
    const trimmed = genreInput.trim();
    if (trimmed && !genres.includes(trimmed)) {
      setGenres([...genres, trimmed]);
      setGenreInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !age || !bio || genres.length === 0) {
      alert("Please fill in all fields!");
      return;
    }
    onSubmit({
      firstName,
      lastName,
      age: parseInt(age, 10),
      bio,
      genres,
    });
    // Clear form
    setFirstName("");
    setLastName("");
    setAge("");
    setBio("");
    setGenres([]);
    setGenreInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="add-artist-form bg-white text-dark p-4 rounded shadow w-100 mw-500 d-flex flex-column gap-3"
    >
      <h2 className="text-center">Add New Artist</h2>

      <input
        type="text"
        className="form-control"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        className="form-control"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input
        type="number"
        className="form-control"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <textarea
        className="form-control"
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
      />

      <div>
        <label className="form-label fw-bold">Genres:</label>
        <div className="d-flex gap-2 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Enter genre"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleAddGenre}
          >
            Add
          </button>
        </div>

        {genres.length > 0 && (
          <div className="d-flex flex-wrap gap-2">
            {genres.map((g, idx) => (
              <span key={idx} className="badge bg-primary text-light">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary mt-2">
        Add Artist
      </button>
    </form>
  );
}
