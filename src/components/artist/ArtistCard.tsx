import React from "react";
import type { ArtistCardProps } from "../../models/Artist";
import "./ArtistCard.css"; // import CSS file

const ArtistCard: React.FC<ArtistCardProps> = ({
  name,
  lastname,
  bio,
  genres,
}) => {
  const truncatedBio =
    bio && bio.length > 100 ? bio.substring(0, 100) + "..." : bio;

  return (
    <div className="card artist-card h-100">
      <div className="card-body d-flex flex-column justify-content-between p-4">
        {/* Artist name */}
        <h5 className="card-title artist-name mb-2">
          {name} {lastname}
        </h5>

        {/* Bio preview */}
        {bio && <p className="card-text artist-bio mb-3">{truncatedBio}</p>}

        {/* Genres */}
        {genres?.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mt-auto">
            {genres.map((genre, idx) => (
              <span key={idx} className="badge genre-badge">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistCard;
