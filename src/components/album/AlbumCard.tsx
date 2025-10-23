import React from "react";
import type { AlbumCardProps } from "../../models/Album";
import albumPlaceholder from "../../assets/album.png";
import "./AlbumCard.css";
import { Link } from "react-router-dom";

const AlbumCard: React.FC<AlbumCardProps> = ({
  albumId,
  genres = [],
  titleList,
  coverUrl,
  musicIds,
}) => {
  console.log("AlbumCard props:", { albumId, genres });

  const handleClick = () => {
    try {
      sessionStorage.setItem(
        `album:${albumId}`,
        JSON.stringify({ genres, musicIds })
      );
    } catch {}
  };

  const trackCount = Array.isArray(musicIds)
    ? musicIds.length
    : Array.isArray(titleList)
    ? titleList.length
    : 0;

  return (
    <Link
      to={`/albums/${encodeURIComponent(albumId)}`}
      state={{ genres, musicIds }}
      onClick={handleClick}
      className="album-card-link"
      aria-label={`Open album ${albumId}`}
    >
      <div className="album-card shadow-sm">
        <div className="album-cover-wrapper">
          <img
            src={coverUrl || albumPlaceholder}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = albumPlaceholder;
            }}
            alt={`Album cover for ${albumId}`}
            className="album-cover"
          />
        </div>

        <div className="album-info">
          <h5 className="album-title">{albumId}</h5>
          <div className="album-meta">
            <div className="album-genres">
              {genres.length > 0 ? (
                genres.map((g, i) => (
                  <span key={i} className="album-genre-badge">
                    {g}
                  </span>
                ))
              ) : (
                <span className="album-genre-badge">Unknown</span>
              )}
            </div>
            <span className="album-tracks">
              {trackCount} {trackCount === 1 ? "track" : "tracks"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AlbumCard;
