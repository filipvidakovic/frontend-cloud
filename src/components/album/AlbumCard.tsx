import React from "react";
import type { AlbumCardProps } from "../../models/Album";
import albumPlaceholder from "../../assets/album.png";
import "./AlbumCard.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import MusicService from "../../services/MusicService";
import AuthService from "../../services/AuthService";

type Props = AlbumCardProps & {
  onDeleted?: (albumId: string) => void; // 🆕 optional callback
};

const AlbumCard: React.FC<Props> = ({
  albumId,
  genres = [],
  titleList,
  coverUrl,
  musicIds,
  onDeleted,
}) => {
  const handleClick = () => {
    try {
      sessionStorage.setItem(
        `album:${albumId}`,
        JSON.stringify({ genres, musicIds })
      );
    } catch {}
  };

    const user = AuthService.getRole();
    const isAdmin = user === "admin";

  const trackCount = Array.isArray(musicIds)
    ? musicIds.length
    : Array.isArray(titleList)
    ? titleList.length
    : 0;

const handleDelete = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  const ok = window.confirm(`Delete album "${albumId}" and all its songs?`);
  if (!ok) return;

  try {
    const ids = Array.isArray(musicIds) ? musicIds : [];
    await MusicService.deleteSongsByIds(ids);       // ← send musicIds
    toast.success(`Album "${albumId}" deleted`);
    onDeleted?.(albumId);
  } catch (err: any) {
    console.error(err);
    toast.error(err?.message || "Failed to delete album");
  }
};


  return (
    <div className="album-card-wrapper">
      {/* Wrap in link, but allow delete button to cancel it */}
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
            <div className="album-header">
              <h5 className="album-title">{albumId}</h5>
              {isAdmin &&(<> <button
                className="album-delete-btn"
                title="Delete album"
                onClick={handleDelete}
              >
                Delete
              </button></>)}
             
            </div>

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
    </div>
  );
};

export default AlbumCard;
