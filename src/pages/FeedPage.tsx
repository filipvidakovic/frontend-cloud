import React, { useEffect, useState } from "react";
import AlbumList from "../components/album/AlbumList";
import SongCard from "../components/song/SongCard";
import type { SongCardProps } from "../components/song/SongCard";
import type { AlbumCardProps } from "../models/Album";
import UserService from "../services/UserService";

const FeedPage: React.FC = () => {
  const [albums, setAlbums] = useState<AlbumCardProps[]>([]);
  const [songs, setSongs] = useState<SongCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await UserService.getFeed();
        console.log("Raw feed response:", res);

        if (cancel) return;

        setSongs(res.songs || []);
        setAlbums(res.albums || []);
      } catch (err: any) {
        if (cancel) return;
        console.error("Error fetching feed:", err.response || err);
        setError("Failed to fetch feed. Please try again.");
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

      {loading && <p className="text-center">Loading feed...</p>}
      {error && <p className="text-danger text-center">{error}</p>}

      {/* SONGS FIRST */}
      {!loading && songs.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3">Recommended Songs</h2>
          <div className="container">
            <div className="row">
              {songs.map((song) => (
                <div key={song.musicId} className="col-md-4 mb-4">
                  <SongCard {...song} showActions={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALBUMS AFTER SONGS */}
      {!loading && albums.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3">Albums</h2>
          <AlbumList albums={albums} genre="" />
        </div>
      )}

      {!loading && songs.length === 0 && albums.length === 0 && !error && (
        <p className="text-muted text-center mt-5">
          No recommendations yet. Start listening, rating, and subscribing to
          get personalized suggestions!
        </p>
      )}
    </div>
  );
};

export default FeedPage;
