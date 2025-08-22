import React, { useState } from "react";
import AlbumList from "../components/album/AlbumList";
import ArtistList from "../components/artist/ArtistList";
import type { AlbumCardProps } from "../models/Album";
import type { ArtistCardProps } from "../models/Artist";
import { discoverAlbums, discoverArtists } from "../ApiService";
import "./DiscoverPage.css";

const DiscoverPage: React.FC = () => {
  const [genre, setGenre] = useState("");
  const [albums, setAlbums] = useState<AlbumCardProps[]>([]);
  const [artists, setArtists] = useState<ArtistCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null); // reset previous errors
    try {
      const [albumsRes, artistsRes] = await Promise.all([
        discoverAlbums(genre),
        discoverArtists(genre),
      ]);

      setAlbums(albumsRes); // backend returns AlbumCardProps[]
      setArtists(artistsRes); // backend returns ArtistCardProps[]
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch albums or artists. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discover-page container mt-5">
      <h1 className="display-4 mb-3 text-center">Discover</h1>
      <p className="lead text-center mb-4">
        Explore your favorite artists and albums from all over the world! 🌍🎵
      </p>

      <div className="search-container mb-5 d-flex justify-content-center gap-2">
        <input
          type="text"
          className="form-control genre-input"
          placeholder="Enter genre..."
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loading || !genre.trim()}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-danger text-center">{error}</p>}

      {albums.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3">Albums</h2>
          <AlbumList albums={albums} />
        </div>
      )}

      {artists.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3">Artists</h2>
          <ArtistList artists={artists} />
        </div>
      )}

      {!loading && albums.length === 0 && artists.length === 0 && !error && (
        <p className="text-muted text-center mt-5">
          No results yet. Enter a genre and click search to explore!
        </p>
      )}
    </div>
  );
};

export default DiscoverPage;
