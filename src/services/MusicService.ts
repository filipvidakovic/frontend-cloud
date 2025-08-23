import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface UploadMusicData {
  title: string;
  fileName: string;
  fileContent: string; // base64 string
  genres: string[];
  artistIds: string[];
  albumId?: string | null;
  coverImage?: string | null; // base64 string (optional)
}

class MusicService {
  async uploadMusic(data: UploadMusicData) {
    try {
        console.log("Request URL:", `${API_URL}/music`);
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
      throw new Error(error.response?.data?.error || "Failed to fetch music details");
    }
  }
}

export default new MusicService();
