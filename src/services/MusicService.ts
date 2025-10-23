// src/services/MusicService.ts
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

export interface EditMusicPayload {
  musicId: string;
  title?: string | null;
  artistIds?: string[];
  genres?: string[];
  albumId?: string | null; // send null to clear
  fileName?: string | null; // required when sending fileContent
  fileContent?: string | null; // base64 (no data: prefix)
  coverImage?: string | null; // base64 (no data: prefix)
  fileUrlSigned?: string | null;
  coverUrlSigned?: string | null;
}

function getJwt() {
  return localStorage.getItem("token");
}

/** Keep nulls (for clearing fields), remove only undefined keys */
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

class MusicService {
  async uploadMusic(data: UploadMusicData) {
    try {
      const token = getJwt();
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
      const token = getJwt();
      const response = await axios.get(`${API_URL}/music`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: { genre, musicId },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch music details"
      );
    }
  }

  async updateMusic(data: EditMusicPayload) {
    try {
      const token = getJwt();
      const payload = stripUndefined(data);
      const response = await axios.put(`${API_URL}/music`, payload, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data; // { message, updatedItem, ... }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Update failed");
    }
  }

  async getAlbumsByGenre(genre: string) {
    try {
      const token = getJwt();
      const response = await axios.get(`${API_URL}/music/albums`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: { genre },
      });
      return response.data.albums || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch albums");
    }
  }

  async batchGetByIds(musicIds: string[]): Promise<Song[]> {
    if (!Array.isArray(musicIds) || musicIds.length === 0) return [];
    const token = getJwt();

    try {
      const res = await axios.post(
        `${API_URL}/music/batchGetByIds`,
        { musicIds }, // only what the lambda needs
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      return res.data as Song[];
    } catch (err: any) {
      const e = err?.response?.data?.error;
      throw new Error(e || "Failed to batch fetch songs");
    }
  }

  async deleteMusic(musicId: string) {
    if (!musicId) throw new Error("musicId is required");
    try {
      const token = getJwt();
      const res = await axios.delete(`${API_URL}/music`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: { musicId },
      });
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Delete failed");
    }
  }
  getDownloadUrl(musicId: string): string {
    if (!musicId) throw new Error("musicId is required");
    return `${API_URL}/music/download?musicId=${encodeURIComponent(musicId)}`;
  }

  /**
   * Trigger a browser download via the API's 302 redirect.
   * Note: if the endpoint is protected by Cognito, an <a> click cannot add Authorization headers.
   * Keep the endpoint public or implement a fetch+blob fallback.
   */
  async downloadMusic(musicId: string): Promise<void> {
    const url = this.getDownloadUrl(musicId);
    const a = document.createElement("a");
    a.href = url;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async getAllSongs(
    limit: number = 6,
    lastKey?: any
  ): Promise<{
    songs: Song[];
    lastKey?: any;
  }> {
    try {
      const token = getJwt();
      const response = await axios.get(`${API_URL}/music/all`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: {
          limit,
          ...(lastKey ? { lastKey: JSON.stringify(lastKey) } : {}),
        },
      });
      console.log(response.data.songs);
      return {
        songs: response.data.songs || [],
        lastKey: response.data.lastKey
          ? JSON.parse(response.data.lastKey)
          : undefined,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch songs");
    }
  }

async getTranscription(musicId: string) {
  try {
    const token = getJwt();
    console.log("Fetching transcription for:", musicId);
    
    const res = await axios.get(`${API_URL}/transcriptions/${musicId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      timeout: 10000,
    });
    
    console.log("Transcription response:", res.data);
    return res.data;
    
  } catch (error: any) {
    console.error("Transcription fetch error:", error);
    if (error.response) {
      // Server responded with error status
      throw new Error(`Transcription error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error: Could not connect to server');
    } else {
      // Something else happened
      throw new Error(`Error: ${error.message}`);
    }
  }
}

}

export default new MusicService();
