import React from "react";
import type { AlbumCardProps } from "../../models/Album";

const AlbumCard: React.FC<AlbumCardProps> = ({ albumId, genre, titleList }) => {
  return (
    <div
      className="card mb-3 shadow-sm border-0 rounded-4"
      style={{ maxWidth: "540px", height: "300px" }} // fixed height
    >
      <div className="row g-0 h-100">
        {/* Album Cover */}
        <div className="col-md-3 d-flex align-items-center justify-content-center bg-light">
          <img
            src="https://via.placeholder.com/150"
            className="img-fluid rounded-start"
            alt={`${albumId} cover`}
          />
        </div>

        {/* Card Content */}
        <div className="col-md-9">
          <div className="card-body d-flex flex-column h-100">
            <h5 className="card-title fw-bold">{albumId}</h5>
            <p className="card-text">
              <span className="badge bg-primary">{genre}</span>
            </p>

            {/* Song List */}
            <ul
              className="list-group list-group-flush small flex-grow-1 overflow-auto"
              style={{ maxHeight: "150px" }} // scrollable area
            >
              {titleList.map((track, idx) => (
                <li key={idx} className="list-group-item">
                  🎵 {track}
                </li>
              ))}
            </ul>

            <p className="card-text mt-2 text-end">
              <small className="text-muted">{titleList.length} tracks</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
