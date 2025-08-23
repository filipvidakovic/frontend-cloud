import React from "react";
import type { ArtistCardProps } from "../../models/Artist";

const ArtistCard: React.FC<ArtistCardProps> = ({ artistId, genres }) => {
  return (
    <div
      className="card mb-3 shadow-sm border-0 rounded-4"
      style={{ maxWidth: "300px", height: "200px" }}
    >
      <div className="card-body d-flex flex-column justify-content-between h-100">
        {/* Artist ID */}
        <h5 className="card-title fw-bold">{artistId}</h5>

        {/* Genres */}
        <div className="mb-2">
          {genres.map((genre, idx) => (
            <span key={idx} className="badge bg-secondary me-1">
              {genre}
            </span>
          ))}
        </div>

        {/* Optional footer */}
        <p className="card-text text-end">
          <small className="text-muted">{genres.length} genres</small>
        </p>
      </div>
    </div>
  );
};

export default ArtistCard;
