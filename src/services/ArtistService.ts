import axios from "axios";
import type { AddArtistData } from "../models/Artist";

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
}

export default new ArtistService();
