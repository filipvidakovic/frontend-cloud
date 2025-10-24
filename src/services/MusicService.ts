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
  albumId?: string | null;
  fileName?: string | null;
  fileContent?: string | null;
  coverImage?: string | null;
  fileUrlSigned?: string | null;
  coverUrlSigned?: string | null;
}

function getJwt() {
  return localStorage.getItem("token");
}

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

class MusicService {
  async uploadMusic(data: UploadMusicData) {
    const token = getJwt();
    try {
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
    const token = getJwt();
    try {
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
    const token = getJwt();
    try {
      const payload = stripUndefined(data);
      const response = await axios.put(`${API_URL}/music`, payload, {
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
    const token = getJwt();
    try {
      const response = await axios.get(`${API_URL}/music/albums`, {
        headers: {
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
        { musicIds },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      return res.data as Song[];
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Failed to batch fetch songs");
    }
  }

  async deleteMusic(musicId: string) {
    if (!musicId) throw new Error("musicId is required");
    const token = getJwt();
    try {
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

  async deleteSongsByIds(musicIds: string[]) {
    if (!Array.isArray(musicIds) || musicIds.length === 0) {
      throw new Error("musicIds (non-empty array) is required");
    }
    const token = getJwt();
    try {
      const res = await axios.post(
        `${API_URL}/music/deleteBatch`,
        { musicIds },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Batch delete failed");
    }
  }

  getDownloadUrl(musicId: string): string {
    if (!musicId) throw new Error("musicId is required");
    return `${API_URL}/music/download?musicId=${encodeURIComponent(musicId)}`;
  }

  async downloadMusic(musicId: string): Promise<void> {
    const url = this.getDownloadUrl(musicId);
    const a = document.createElement("a");
    a.href = url;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async getAllSongs(limit: number = 6, lastKey?: any): Promise<{ songs: Song[]; lastKey?: any }> {
    const token = getJwt();
    try {
      const response = await axios.get(`${API_URL}/music/all`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: {
          limit,
          ...(lastKey ? { lastKey: JSON.stringify(lastKey) } : {}),
        },
      });
      return {
        songs: response.data.songs || [],
        lastKey: response.data.lastKey ? JSON.parse(response.data.lastKey) : undefined,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch songs");
    }
  }

  async getSignedGetUrl(musicId: string): Promise<string> {
    const token = getJwt();
    if (!token) throw new Error("Not authenticated");

    const u = new URL(`${API_URL}/music/signedGet`);
    u.searchParams.set("musicId", musicId);

    const res = await fetch(u.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`signedGet failed: ${res.status} ${t}`);
    }

    const data = await res.json();
    const signed = data?.fileUrlSigned ?? data?.url;
    if (!signed) throw new Error("signedGet: response missing URL");
    return signed;
  }

  async getTranscription(musicId: string) {
    const token = getJwt();
    try {
      const res = await axios.get(`${API_URL}/transcriptions/${musicId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 10000,
      });
      return res.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Transcription error: ${error.response.status} - ${error.response.data?.error || "Unknown error"}`);
      } else if (error.request) {
        throw new Error("Network error: Could not connect to server");
      } else {
        throw new Error(error.message);
      }
    }
  }

  async getSongsByArtistId(artistId: string, opts?: { offset?: number; limit?: number }): Promise<Song[]> {
    if (!artistId) throw new Error("artistId is required");

    const token = getJwt();
    try {
      const res = await axios.get(`${API_URL}/music/by-artist/${encodeURIComponent(artistId)}`, {
        params: {
          ...(opts?.offset != null ? { offset: opts.offset } : {}),
          ...(opts?.limit != null ? { limit: opts.limit } : {}),
        },
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return res.data as Song[];
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || "Failed to load artist songs");
    }
  }
}

export default new MusicService();
