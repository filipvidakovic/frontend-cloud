import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import AddArtistForm from "./components/artist/AddArtistForm";
import type { AlbumCardProps } from "./models/Album";
import type { ArtistCardProps } from "./models/Artist";
import AlbumList from "./components/album/AlbumList";
import ArtistList from "./components/artist/ArtistList";
import DiscoverPage from "./pages/DiscoverPage";
import Header from "./components/header/Header";
function App() {
  const staticAlbums: AlbumCardProps[] = [
    { albumId: "ALB-001", genre: "Rock", titleList: ["Song A", "Song B"] },
    { albumId: "ALB-002", genre: "Jazz", titleList: ["Track 1", "Track 2"] },
    { albumId: "ALB-003", genre: "Pop", titleList: ["Hit Single"] },
  ];

  const staticArtists: ArtistCardProps[] = [
    { artistId: "ART-001", genres: ["Rock", "Blues"] },
    { artistId: "ART-002", genres: ["Jazz"] },
    { artistId: "ART-003", genres: ["Pop", "Dance"] },
  ];

  const handleAddArtist = (artist: {
    firstName: string;
    lastName: string;
    age: number;
    bio: string;
    genres: string[];
  }) => {
    console.log("New artist added:", artist);
    alert(`Artist ${artist.firstName} ${artist.lastName} added!`);
  };

  return (
    <Router>
      <Header></Header>

      <Routes>
        <Route path="/" />

        <Route path="/discover" element={<DiscoverPage />} />
      </Routes>
    </Router>
  );
}

export default App;
