import React from "react";
import AlbumCard from "./AlbumCard";
import type { AlbumListProps } from "../../models/Album";

const AlbumList: React.FC<AlbumListProps> = ({ albums, genre }) => {
  return (
    <div className="container">
      <div className="row">
        {albums.map((album) => (
          <div key={album.albumId} className="col-md-3 mb-4">
            <AlbumCard
              albumId={album.albumId}
              genre={genre}
              titleList={album.titleList}
              coverUrl={album.coverUrl}
              musicIds={album.musicIds}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumList;
