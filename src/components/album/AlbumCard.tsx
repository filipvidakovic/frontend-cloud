import React from "react";
import type { AlbumCardProps } from "../../models/Album";
import albumPlaceholder from "../../assets/album.png";
import "./AlbumCard.css"; // import CSS file

const AlbumCard: React.FC<AlbumCardProps> = ({
  albumId,
  genre,
  titleList,
  coverUrl,
}) => {
  console.log(`Album [${albumId}] Cover URL:`, coverUrl);

  return (
    <div className="card album-card h-100">
      <div className="row g-0 h-100">
        {/* Album Cover */}
        <div className="col-md-4 d-flex align-items-center justify-content-center bg-light rounded-start">
          <img
            src={coverUrl}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = albumPlaceholder;
            }}
            alt="Album cover"
            className="img-fluid rounded-start album-cover"
          />
        </div>

        {/* Card Content */}
        <div className="col-md-8">
          <div className="card-body d-flex flex-column h-100 p-4">
            <h5 className="card-title album-title mb-2">{albumId}</h5>

            <p className="mb-3">
              <span className="badge genre-badge">{genre}</span>
            </p>

            {/* Song List */}
            <ul className="album-track-list flex-grow-1 overflow-auto">
              {titleList.map((track, idx) => (
                <li key={idx} className="album-track">
                  🎵 {track}
                </li>
              ))}
            </ul>

            <p className="card-text mt-2 text-end">
              <small className="track-count">{titleList.length} tracks</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
