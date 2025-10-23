import React, { useEffect, useState } from "react";
import AlbumList from "../components/album/AlbumList";
import SongCard from "../components/song/SongCard";
import type { SongCardProps } from "../components/song/SongCard";
import type { AlbumCardProps } from "../models/Album";
import UserService from "../services/UserService";
import "./FeedPage.css";
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
        console.log(
          "Albums after map:",
          (res.albums || []).map((a: any) => a.genres)
        );

        const newSongs = res.songs || [];

        const mapped: SongCardProps[] = newSongs.map((song: any) => ({
          musicId: song.musicId,
          title: song.title,
          genres: song.genres || [],
          album: song.albumId ?? null,
          fileUrl: song.fileUrl ?? "",
          coverUrl: song.coverUrl ?? null,
          artists: [],
        }));

        setSongs(mapped);
        setAlbums(
          (res.albums || []).map((a: any) => {
            const songWithCover = res.songs.find(
              (s: any) => s.albumId === a.albumId && s.coverUrl
            );
            return {
              albumId: a.albumId,
              genres: a.genres || [],
              titleList: a.songs?.map((s: any) => s.title) || [],
              coverUrl: songWithCover?.coverUrl || a.coverUrl || "",
              musicIds: a.songs || [],
            };
          })
        );
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
        <div className="feed-section mb-5">
          <h2 className="section-heading">Recommended Songs</h2>
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
        <div className="feed-section mb-5">
          <h2 className="section-heading">Albums</h2>
          <AlbumList albums={albums} />
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
