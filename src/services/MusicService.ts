import axios from "axios";
import type { Song } from "../models/Song";

const API_URL = import.meta.env.VITE_API_URL;

export interface UploadMusicData {
  title: string;
  fileName: string;
  genres: string[];
  artistIds: string[];
  albumId?: string | null;
  coverImage?: string | null;
  fileContent: string;
}

export interface UpdateMusicData {
  musicId: string;
  title: string | null;
  fileName: string | null;
  fileContent: string | null;
  coverImage: string | null;
}

class MusicService {
  async uploadMusic(data: UploadMusicData) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/music`, data, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Music upload failed");
    }
  }

  async getMusicDetails(genre: string, musicId: string) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/music`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: {
          genre,
          musicId,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch music details"
      );
    }
  }

  async updateMusic(data: UpdateMusicData) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_URL}/music`, data, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Update failed");
    }
  }
  async getAlbumsByGenre(genre: string) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/music/albums`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: { genre },
      });

      console.log("📀 getAlbumsByGenre response:", response.data);
      return response.data.albums || [];
    } catch (error: any) {
      console.error("❌ Error fetching albums:", error);
      throw new Error(error.response?.data?.error || "Failed to fetch albums");
    }
  }
  async batchGetByGenre(genre: string, musicIds: string[]) {
    if (!genre) throw new Error("genre is required");
    if (!Array.isArray(musicIds) || musicIds.length === 0) {
      return []; // nothing to fetch
    }

    try {
      const response = await axios.post(
        `${API_URL}/music/batchGetByGenre`,
        { genre, musicIds },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data as Song[];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to batch fetch songs"
      );
    }
  }

}

export default new MusicService();
