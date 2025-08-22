// src/services/api.ts

const API_URL = import.meta.env.VITE_API_URL;
// Example: https://abc123.execute-api.eu-central-1.amazonaws.com/prod

export async function discoverAlbums(genre: string) {
  const res = await fetch(`${API_URL}/music/discover-albums?genre=${genre}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to discover albums");
  return res.json();
}

export async function discoverArtists(genre: string) {
  const res = await fetch(`${API_URL}/music/discover-artists?genre=${genre}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to discover artists");
  return res.json();
}
