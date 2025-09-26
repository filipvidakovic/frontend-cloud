import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

class UserService {
  async recordListening(genre: string) {
    try {
      const token = localStorage.getItem("token");

      const resp = await axios.post(
        `${API_URL}/record-play`,
        { genre },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      console.log("✅ Recorded listening:", resp.data);
      return resp.data;
    } catch (err: any) {
      console.error("❌ Error recording listening:", err);
      throw err;
    }
  }
  async getFeed() {
    try {
      const token = localStorage.getItem("token");

      const resp = await axios.get(`${API_URL}/feed`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log("✅ Feed fetched:", resp.data);
      return resp.data; // { songs: [...], artists: [...] }
    } catch (err: any) {
      console.error("❌ Error fetching feed:", err);
      throw err;
    }
  }

  async refreshFeed() {
    try {
      const token = localStorage.getItem("token");

      const resp = await axios.post(
        `${API_URL}/feed/recalculate`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      console.log("✅ Feed recalculated:", resp.data);
      return resp.data;
    } catch (err: any) {
      console.error("❌ Error recalculating feed:", err);
      throw err;
    }
  }
}

export default new UserService();
