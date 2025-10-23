import axios from "axios";
import type { AddArtistData } from "../models/Artist";
import type { ArtistCardProps } from "../models/Artist";
const API_URL = import.meta.env.VITE_API_URL;

class ArtistService {
  async addArtist(data: AddArtistData) {
    try {
      const token = localStorage.getItem("token");

      console.log("🔼 Sending artist payload:", data);

      const response = await axios.post(`${API_URL}/artists`, data, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log("✅ Artist creation response:", response);

      // Debug response structure
      if (!response.data?.artist) {
        console.warn("⚠️ Response does not contain artist:", response.data);
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating artist:", error);
      throw new Error(error.response?.data?.error || "Artist creation failed");
    }
  }
  async getArtistsByGenre(genre: string): Promise<ArtistCardProps[]> {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/artists`, {
        params: { genre },
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log("✅ Artists fetch response:", response.data);

      // return just the array
      return response.data.artists || [];
    } catch (error: any) {
      console.error("❌ Error fetching artists:", error);
      throw new Error(error.response?.data?.error || "Failed to fetch artists");
    }
  }

  async getArtistById(artistId: string): Promise<ArtistCardProps> {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/artists/${artistId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching artists:", error);
      throw new Error(error.response?.data?.error || "Failed to fetch artists");
    }
  }

  async deleteArtist(artistId: string) {
  const token = localStorage.getItem("token");
  const url = `${API_URL}/artists/${artistId}`; 
  const res = await axios.delete(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}


async updateArtist(artistId: string, data: Partial<ArtistCardProps> & {
  age?: number; bio?: string; genres?: string[]; name?: string; lastname?: string;
}) {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${API_URL}/artists/${artistId}`, data, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  } catch (err: any) {
    console.error("❌ Error updating artist:", err);
    throw new Error(err.response?.data?.error || "Artist update failed");
  }
}


}

export default new ArtistService();
