import React from "react";
import type { AlbumCardProps } from "../../models/Album";
import albumPlaceholder from "../../assets/album.png";
import "./AlbumCard.css";
import { Link } from "react-router-dom";

const AlbumCard: React.FC<AlbumCardProps> = ({
  albumId,
  genre,
  titleList,   // kept only as a fallback for counting
  coverUrl,
  musicIds,
}) => {
  const handleClick = () => {
    try {
      sessionStorage.setItem(
        `album:${albumId}`,
        JSON.stringify({ genre, musicIds })
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
      state={{ genre, musicIds }}
      onClick={handleClick}
      className="text-decoration-none text-dark d-block"
      aria-label={`Open album ${albumId}`}
    >
      <div className="card album-card h-100">
        <div className="row g-0 h-100">
          {/* Cover */}
          <div className="col-5 col-md-4 d-flex align-items-center justify-content-center bg-light rounded-start">
            <img
              src={coverUrl}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = albumPlaceholder;
              }}
              alt={`Album cover for ${albumId}`}
              className="img-fluid rounded-start album-cover"
            />
          </div>

          {/* Content */}
          <div className="col-7 col-md-8">
            <div className="card-body d-flex flex-column justify-content-center h-100 p-4">
              <h5 className="card-title album-title mb-2">{albumId}</h5>

              <div className="d-flex align-items-center gap-2">
                <span className="badge genre-badge">{genre}</span>
                <small className="text-muted">
                  {trackCount} {trackCount === 1 ? "track" : "tracks"}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AlbumCard;
