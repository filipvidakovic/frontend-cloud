import React, { useEffect, useState } from "react";
import AlbumList from "../components/album/AlbumList";
import ArtistList from "../components/artist/ArtistList";
import type { AlbumCardProps } from "../models/Album";
import type { ArtistCardProps } from "../models/Artist";
import UserService from "../services/UserService";
const FeedPage: React.FC = () => {
  const [songs, setSongs] = useState<AlbumCardProps[]>([]);
  const [artists, setArtists] = useState<ArtistCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { songs: songsRes, artists: artistsRes } =
          await UserService.getFeed();
        if (cancel) return;
        setSongs(songsRes || []);
        setArtists(artistsRes || []);
      } catch (err: any) {
        if (cancel) return;
        console.error("Error fetching feed:", err);
        setError("Failed to fetch recommendations. Please try again.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="feed-page container mt-5">
      <h1 className="display-4 mb-3 text-center">Your Feed</h1>
      <p className="lead text-center mb-4">
        Personalized recommendations based on your listening, ratings, and
        subscriptions 🎶✨
      </p>

      {loading && <p className="text-center">Loading recommendations...</p>}
      {error && <p className="text-danger text-center">{error}</p>}

      {!loading && songs.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3">Recommended Songs</h2>
          <AlbumList albums={songs} genre="feed" />
        </div>
      )}

      {!loading && artists.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3">Recommended Artists</h2>
          <ArtistList artists={artists} />
        </div>
      )}

      {!loading && songs.length === 0 && artists.length === 0 && !error && (
        <p className="text-muted text-center mt-5">
          No recommendations yet. Start listening, rating, and subscribing to
          get personalized suggestions!
        </p>
      )}
    </div>
  );
};

export default FeedPage;
