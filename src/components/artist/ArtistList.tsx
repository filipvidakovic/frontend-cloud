import React from "react";
import ArtistCard from "./ArtistCard";
import type { ArtistCardProps } from "../../models/Artist";

export interface ArtistListProps {
  artists: ArtistCardProps[];
}

const ArtistList: React.FC<ArtistListProps> = ({ artists }) => {
  return (
    <div className="container">
      <div className="row">
        {artists.map((artist) => (
          <div key={artist.artistId} className="col-md-4 mb-4">
            <ArtistCard artistId={artist.artistId} genres={artist.genres} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistList;
