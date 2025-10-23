import React, { useEffect, useMemo, useState } from "react";
import AlbumList from "../components/album/AlbumList";
import ArtistList from "../components/artist/ArtistList";
import type { AlbumCardProps } from "../models/Album";
import type { ArtistCardProps } from "../models/Artist";
import MusicService from "../services/MusicService";
import ArtistService from "../services/ArtistService";
import SubscribeService from "../services/SubscribeService";
import { useSearchParams, useNavigationType } from "react-router-dom";
import "./DiscoverPage.css";

const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navType = useNavigationType();

  const urlGenre = searchParams.get("genre") || "";
  const [searchInput, setSearchInput] = useState(urlGenre);
  const [genre, setGenre] = useState(urlGenre);

  const [albums, setAlbums] = useState<AlbumCardProps[]>([]);
  const [artists, setArtists] = useState<ArtistCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => `discover:genre=${urlGenre}`, [urlGenre]);

  useEffect(() => {
    const cachedRaw = sessionStorage.getItem(cacheKey);
    if (navType === "POP" && cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw);
        setAlbums(cached.albums || []);
        setArtists(cached.artists || []);
        setError(null);
        setLoading(false);
        setGenre(urlGenre);
        return;
      } catch {
        // fall through to fetch
      }
    }
    console.log("Use effect running, urlGenre:", urlGenre);
    if (urlGenre) {
      let cancel = false;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          console.log("Fetching albums and artists...");
          const [albumsRes, artistsRes] = await Promise.all([
            await MusicService.getAlbumsByGenre(urlGenre),
            await ArtistService.getArtistsByGenre(urlGenre),
          ]);
          console.log("Albums fetched:", albumsRes);
          console.log("Artists fetched:", artistsRes);
          if (cancel) return;
          setAlbums(albumsRes);
          setArtists(artistsRes);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ albums: albumsRes, artists: artistsRes })
          );
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

  const handleSearch = async () => {
    const g = searchInput.trim();
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
      setGenre("");
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
      setGenre(g);
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

  const handleSubscribeToGenre = async () => {
    try {
      await SubscribeService.subscribe({
        type: "genre",
        id: `${genre.trim()}`,
      });
    } catch (err) {
      console.error("Error subscribing to genre:", err);
    }
  };
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && searchInput.trim() && !loading) {
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loading || !searchInput.trim()}
        >
          {loading ? "Searching..." : "Search"}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubscribeToGenre}
          disabled={loading || !genre.trim()}
        >
          {loading ? "Searching..." : "Subscribe to genre"}
        </button>
      </div>

      {error && <p className="text-danger text-center">{error}</p>}

      {!loading && albums.length > 0 && (
        <div className="discover-section mb-5">
          <h2 className="section-heading">Albums</h2>
          <AlbumList albums={albums} />
        </div>
      )}

      {!loading && artists.length > 0 && (
        <div className="discover-section mb-5">
          <h2 className="section-heading">Artists</h2>
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
