import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Base interface for shared music fields
interface BaseMusicData {
  title: string;
  fileName: string;
  genres: string[];
  artistIds: string[];
  albumId?: string | null;
  coverImage?: string | null; // optional for both
}

// Upload requires fileContent
export interface UploadMusicData extends BaseMusicData {
  fileContent: string; // ✅ required
}

// Update allows optional fileContent
export interface UpdateMusicData extends BaseMusicData {
  musicId: string;
  fileContent?: string; // ✅ optional
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
      throw new Error(error.response?.data?.error || "Failed to fetch music details");
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
}

export default new MusicService();
