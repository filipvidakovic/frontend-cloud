import React from "react";
import ArtistCard from "./ArtistCard";
import type { ArtistCardProps } from "../../models/Artist";

export interface ArtistListProps {
  artists: ArtistCardProps[];
  onDeleted?: (artistId: string) => void;                                
  onUpdated?: (artistId: string, u: Partial<ArtistCardProps>) => void;  
}

const ArtistList: React.FC<ArtistListProps> = ({ artists }) => {
  if (!Array.isArray(artists)) {
    return <p className="text-muted">No artists found.</p>;
  }

  if (artists.length === 0) {
    return <p className="text-muted">No artists found.</p>;
  }

  return (
    <div className="container">
      <div className="row">
        {artists.map((artist) => (
          <div key={artist.artistId} className="col-md-4 mb-4">
            <ArtistCard {...artist} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistList;
