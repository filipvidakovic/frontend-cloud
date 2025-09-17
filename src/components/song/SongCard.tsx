import React, { useEffect, useRef, useState } from "react";
import placeholderCover from "../../assets/album.png";
import "./SongCard.css";

interface SongCardProps {
  title: string;
  genre: string;
  album?: string | null;
  fileUrl: string;          // presigned/public URL
  coverUrl?: string | null;
  artists?: string[];
}

const SongCard: React.FC<SongCardProps> = ({
  title,
  genre,
  album,
  fileUrl,
  coverUrl,
  artists = [],
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      if (el.paused) {
        await el.play();
        setPlaying(true); // optimistic; events will keep it in sync
      } else {
        el.pause();
      }
    } catch (err) {
      console.error("Audio play failed:", err, { src: el?.currentSrc });
      setPlaying(false);
    }
  };

  // (Re)attach listeners whenever the audio element or src changes
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

    // If the src just changed, ensure UI is reset until play starts
    setPlaying(!el.paused && !el.ended);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [fileUrl]); // <-- re-run when src changes (element remounted due to key)

  const disabled = !fileUrl;
  const artistsLabel = artists.length ? artists.join(", ") : null;

  return (
    <div className={`song-card ${playing ? "playing" : ""}`}>
      <img
        src={coverUrl || placeholderCover}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderCover; }}
        alt={`${title} cover`}
        className="song-card-cover"
      />

      <div className="song-card-content">
        <h6 className="song-card-title">{title}</h6>

        {artistsLabel && (
          <div className="song-card-line song-card-artists" title={artistsLabel}>
            <span className="song-chip">🎤</span>
            <span className="song-ellipsis">{artistsLabel}</span>
          </div>
        )}

        <div className="song-card-line song-card-meta">
          <span className="song-chip">🎧</span>
          <span className="song-ellipsis">
            {genre}{album ? ` · Album: ${album}` : ""}
          </span>
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

      {/* key forces a fresh element when URL changes; effect above rebinds listeners */}
      <audio ref={audioRef} src={fileUrl} preload="none" key={fileUrl} />
    </div>
  );
};

export default SongCard;
