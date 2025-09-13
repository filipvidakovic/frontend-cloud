import React, { useEffect, useMemo, useState } from "react";
import AlbumList from "../components/album/AlbumList";
import ArtistList from "../components/artist/ArtistList";
import type { AlbumCardProps } from "../models/Album";
import type { ArtistCardProps } from "../models/Artist";
import MusicService from "../services/MusicService";
import ArtistService from "../services/ArtistService";
import { useSearchParams, useNavigationType } from "react-router-dom";
import "./DiscoverPage.css";

const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navType = useNavigationType(); // 'POP' when using browser back/forward

  // seed input from URL (?genre=...)
  const urlGenre = searchParams.get("genre") || "";
  const [genre, setGenre] = useState(urlGenre);

  const [albums, setAlbums] = useState<AlbumCardProps[]>([]);
  const [artists, setArtists] = useState<ArtistCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // cache key per-genre
  const cacheKey = useMemo(() => `discover:genre=${urlGenre}`, [urlGenre]);

  // Initial load + back/forward handling
  useEffect(() => {
    // If we navigated here via Back/Forward (POP), try cache first and skip fetch
    const cachedRaw = sessionStorage.getItem(cacheKey);
    if (navType === "POP" && cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw);
        setAlbums(cached.albums || []);
        setArtists(cached.artists || []);
        setError(null);
        setLoading(false);
        // also sync the input box with the URL
        setGenre(urlGenre);
        return;
      } catch {
        // fall through to fetch
      }
    }

    // If there's a genre in the URL and we didn't come via POP (or no cache), fetch
    if (urlGenre) {
      let cancel = false;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const [albumsRes, artistsRes] = await Promise.all([
            MusicService.getAlbumsByGenre(urlGenre),
            ArtistService.getArtistsByGenre(urlGenre),
          ]);
          if (cancel) return;
          setAlbums(albumsRes);
          setArtists(artistsRes);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ albums: albumsRes, artists: artistsRes })
          );
          // keep input in sync
          setGenre(urlGenre);
        } catch (err: any) {
          if (cancel) return;
          console.error("Error fetching data:", err);
          setError("Failed to fetch albums or artists. Please try again.");
        } finally {
          if (!cancel) setLoading(false);
        }
      })();
      return () => {
        cancel = true;
      };
    } else {
      // no genre in URL: clear lists (first visit)
      setAlbums([]);
      setArtists([]);
      setLoading(false);
      setError(null);
    }
  }, [urlGenre, cacheKey, navType]);

  // Trigger a new search: write to URL AND fetch + cache
  const handleSearch = async () => {
    const g = genre.trim();
    // push the query to the URL (creates a history entry so Back works)
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (g) p.set("genre", g);
      else p.delete("genre");
      return p;
    });

    if (!g) {
      setAlbums([]);
      setArtists([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [albumsRes, artistsRes] = await Promise.all([
        MusicService.getAlbumsByGenre(g),
        ArtistService.getArtistsByGenre(g),
      ]);
      setAlbums(albumsRes);
      setArtists(artistsRes);
      sessionStorage.setItem(
        `discover:genre=${g}`,
        JSON.stringify({ albums: albumsRes, artists: artistsRes })
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch albums or artists. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && genre.trim() && !loading) {
      handleSearch();
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
          onKeyDown={onKeyDown}
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
          <AlbumList albums={albums} genre={genre} />
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
