import { useState } from "react";
import "./App.css";
import AddArtistForm from "./components/AddArtistForm";

function App() {
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
    <>
      <header className="app-header">
        <h1 className="display-3">MySpotify</h1>
        <p>Your music, your way.</p>
      </header>

      <div className="form-container">
        <AddArtistForm onSubmit={handleAddArtist} />
      </div>
    </>
  );
}

export default App;
