import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function getJwt() {
  const idToken = localStorage.getItem("token");
  return idToken;
}

const RateService = {
  async setRate(musicId: string, rate: "love" | "like" | "dislike") {
    const token = getJwt();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    return axios.post(
      `${API_URL}/rate`,
      { musicId, rate },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  },

  async deleteRate(musicId: string) {
    const token = getJwt();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    return axios.delete(`${API_URL}/rate`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: { musicId },
    });
  },

  async getRates(userId: string) {
    const token = getJwt();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    return axios.get(`${API_URL}/rate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { userId },
    });
  },
};

export default RateService;
