import React, { useEffect, useRef, useState } from "react";
import placeholderCover from "../../assets/album.png";
import "./SongCard.css";
import UserService from "../../services/UserService";
import RateService from "../../services/RateService";
import { toast } from "react-toastify";

interface SongCardProps {
  musicId: string;
  title: string;
  genre: string;
  album?: string | null;
  fileUrl: string;
  coverUrl?: string | null;
  artists?: string[];
  initialRate?: "love" | "like" | "dislike" | null;
}

const SongCard: React.FC<SongCardProps> = ({
  musicId,
  title,
  genre,
  album,
  fileUrl,
  coverUrl,
  artists = [],
  initialRate = null,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState<"love" | "like" | "dislike" | null>(
    initialRate
  );

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      if (el.paused) {
        await el.play();
        setPlaying(true);
        try {
          await UserService.recordListening(genre);
        } catch (err) {
          console.error("Failed to record listening:", err);
        }
      } else {
        el.pause();
      }
    } catch (err) {
      console.error("Audio play failed:", err, { src: el?.currentSrc });
      setPlaying(false);
    }
  };

  // attach audio listeners
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onError = () => {
      console.error("Audio error", el.error, { src: el.currentSrc });
      setPlaying(false);
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    setPlaying(!el.paused && !el.ended);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [fileUrl]);

  // ---- Reactions ----
  const handleRate = async (newRate: "love" | "like" | "dislike") => {
    try {
      if (rate === newRate) {
        // deselect
        await RateService.deleteRate(musicId);
        setRate(null);
        toast.success("Rate removed successfully ✅");
      } else {
        // switch / set
        const resp = await RateService.setRate(musicId, newRate);
        setRate(newRate);
        toast.success(`You rated this song: ${newRate} ✅`);
      }
    } catch (err) {
      console.error("Failed to update rate:", err);
      toast.error("Failed to update rate");
    }
  };

  const disabled = !fileUrl;
  const artistsLabel = artists.length ? artists.join(", ") : null;

  return (
    <div className={`song-card ${playing ? "playing" : ""}`}>
      <img
        src={coverUrl || placeholderCover}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = placeholderCover;
        }}
        alt={`${title} cover`}
        className="song-card-cover"
      />

      <div className="song-card-content">
        <h6 className="song-card-title">{title}</h6>

        {artistsLabel && (
          <div
            className="song-card-line song-card-artists"
            title={artistsLabel}
          >
            <span className="song-chip">🎤</span>
            <span className="song-ellipsis">{artistsLabel}</span>
          </div>
        )}

        <div className="song-card-line song-card-meta">
          <span className="song-chip">🎧</span>
          <span className="song-ellipsis">
            {genre}
            {album ? ` · Album: ${album}` : ""}
          </span>
        </div>

        {/* Reaction buttons */}
        <div className="song-card-reactions">
          <button
            type="button"
            className={`reaction-btn ${rate === "love" ? "active" : ""}`}
            onClick={() => handleRate("love")}
            title="Love"
          >
            ❤️
          </button>
          <button
            type="button"
            className={`reaction-btn ${rate === "like" ? "active" : ""}`}
            onClick={() => handleRate("like")}
            title="Like"
          >
            👍
          </button>
          <button
            type="button"
            className={`reaction-btn ${rate === "dislike" ? "active" : ""}`}
            onClick={() => handleRate("dislike")}
            title="Dislike"
          >
            👎
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`song-card-play-btn ${playing ? "pause" : ""}`}
        onClick={togglePlay}
        disabled={disabled}
        aria-pressed={playing}
        title={playing ? "Pause" : "Play"}
      >
        {playing ? "⏸" : "▶️"}
      </button>

      <audio ref={audioRef} src={fileUrl} preload="none" key={fileUrl} />
    </div>
  );
};

export default SongCard;
