
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import SongCard from "../components/song/SongCard";
import ArtistService from "../services/ArtistService";
import type { Song } from "../models/Song"; 
import MusicService from "../services/MusicService";
import "./ArtistSongsPage.css";

interface LocationState {
    artistName?: string;
    genres?: string[];
}

export default function ArtistSongsPage() {
    const { artistId = "" } = useParams<{ artistId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Dohvati podatke o izvođaču iz state-a navigacije (ako postoje)
    const state = (location.state as LocationState) || {};
    const artistName = state.artistName || "Unknown Artist";

    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSongId, setActiveSongId] = useState<string | null>(null);

    useEffect(() => {
        if (!artistId) {
            setError("Missing artist ID.");
            setLoading(false);
            return;
        }

        const fetchSongs = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await MusicService.getSongsByArtistId(artistId);
                setSongs(data);
            } catch (e: any) {
                setError(e?.message || `Failed to load songs for artist ${artistName}.`);
                console.error("Error fetching artist songs:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, [artistId]);
    
    // Handler za uklanjanje pesme nakon brisanja
    const handleDeleted = (removedId: string) => {
        setSongs((prev) => prev.filter((s) => s.musicId !== removedId));
    };

    // Handler za ažuriranje pesme (slično kao u AlbumDetailPage)
    const handleSongUpdated = (updatedItem: Partial<Song> & { musicId: string }) => {
        setSongs((prevSongs) => 
            prevSongs.map((song) => {
                if (song.musicId === updatedItem.musicId) {
                    // Spojite stari objekat pesme sa novim ažuriranim podacima.
                    const updatedSong = {
                        ...song,
                        ...updatedItem,
                        // KLJUČNO: Ažurirajte PROPS koje SongCard koristi
                        fileUrl: updatedItem.fileUrlSigned || song.fileUrl,
                        coverUrl: updatedItem.coverUrlSigned || song.coverUrl,
                    };
                    
                    // Obrada albumId: dozvolite null da obriše album
                    if ("albumId" in updatedItem) {
                        updatedSong.albumId = updatedItem.albumId; 
                    }
                    
                    return updatedSong as Song;
                }
                return song;
            })
        );
    };


    return (
        <div className="artist-songs-container container mt-4">
            <div className="artist-songs-header mb-4 d-flex align-items-center">
                <button className="btn btn-link me-3" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <h2 className="mb-0">Songs by: **{artistName}**</h2>
                {state.genres && state.genres.length > 0 && (
                     <div className="ms-3 d-flex flex-wrap gap-2">
                        {state.genres.map((g, i) => (
                             <span key={i} className="badge bg-primary">
                                {g}
                            </span>
                        ))}
                     </div>
                )}
            </div>
            <hr />

            {loading && <div className="text-center">Loading songs...</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            {!loading && !error && songs.length === 0 && (
                <div className="alert alert-info">No songs found for this artist.</div>
            )}

            <div className="row g-4">
                {songs.map((s) => (
                    <div key={s.musicId} className="col-lg-6 col-xl-4">
                        <SongCard
                            musicId={s.musicId}
                            title={s.title}
                            genres={s.genres ?? []}
                            album={s.albumId ?? undefined}
                            fileUrl={s.fileUrl ?? ""}
                            coverUrl={s.coverUrl}
                            artists={s.artists || []} // Uključite artist prop ako ga SongCard podržava
                            initialRate={s.rate ?? null}
                            onDeleted={handleDeleted}
                            onPlaySelected={setActiveSongId}
                            onUpdated={handleSongUpdated} 
                        />
                    </div>
                ))}
            </div>

            {/* Opciono: Dodajte plejer/transkripciju slično AlbumPage-u ako je potrebno */}
        </div>
    );
}