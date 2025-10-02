import { useEffect, useState } from "react";
import SongCard, { type SongCardProps } from "../components/song/SongCard";
import MusicService from "../services/MusicService";
import type { Song } from "../models/Song";

function HomePage() {
  const [songs, setSongs] = useState<SongCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchSongs = async (append = false) => {
    setLoading(true);
    setError(null);
    try {
      const { songs: newSongs, lastKey: newLastKey } =
        await MusicService.getAllSongs(6, lastKey);

      const mapped: SongCardProps[] = newSongs.map((song: Song) => ({
        musicId: song.musicId,
        title: song.title,
        genre: song.genre || "",
        album: song.albumId ?? null,
        fileUrl: song.fileUrl ?? "",
        coverUrl: song.coverUrl ?? null,
        artists: [],
      }));

      setSongs((prev) => (append ? [...prev, ...mapped] : mapped));
      setLastKey(newLastKey || null);
      setHasMore(!!newLastKey);
    } catch (err: any) {
      setError(err.message || "Failed to fetch songs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs(false);
  }, []);

  return (
    <div className="home-page container mt-5">
      <h1 className="display-4 mb-3 text-center">Welcome to MusicHub 🎵</h1>
      <p className="lead text-center mb-4">
        Enjoy all songs in one place. Start listening now!
      </p>

      {loading && songs.length === 0 && (
        <p className="text-center">Loading songs...</p>
      )}
      {error && <p className="text-danger text-center">{error}</p>}

      {!loading && songs.length > 0 && (
        <div className="container">
          <div className="row">
            {songs.map((song) => (
              <div key={song.musicId} className="col-md-4 mb-4">
                <SongCard {...song} showActions={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && songs.length === 0 && !error && (
        <p className="text-muted text-center mt-5">No songs available yet.</p>
      )}

      {hasMore && !loading && (
        <div className="text-center mt-4">
          <button
            className="btn btn-primary"
            onClick={() => fetchSongs(true)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
