import React from "react";
import type { ArtistCardProps } from "../../models/Artist";
import "./ArtistCard.css"; // import CSS file
import { subscribeToArtist } from "../../services/SubscribeService";

const ArtistCard: React.FC<ArtistCardProps> = ({
  artistId,
  name,
  lastname,
  bio,
  genres,
}) => {
  const truncatedBio =
    bio && bio.length > 100 ? bio.substring(0, 100) + "..." : bio;

  function subscribe(artistId: string): void {
    let data = {
      type: "artist",
      id: artistId,
      action: "subscribe",
      userId: undefined
    }
    subscribeToArtist(data);
  }

  return (
    <div className="card artist-card h-100">
      <div className="card-body d-flex flex-column justify-content-between p-4">
        {/* Artist name */}
        <h5 className="card-title artist-name mb-2">
          {name} {lastname}
        </h5>

        {/* Bio preview */}
        {bio && <p className="card-text artist-bio mb-3">{truncatedBio}</p>}

        <button className="btn btn-sm btn-outline-primary mb-3" onClick={() => subscribe(artistId)}>
          Subscribe
        </button>

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
