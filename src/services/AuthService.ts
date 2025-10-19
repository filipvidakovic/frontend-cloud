import axios from "axios";
import { jwtDecode } from "jwt-decode";

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  birthdate: string;
}

const API_URL = import.meta.env.VITE_API_URL;

class AuthService {
async login(data: LoginData) {
    try {
      localStorage.clear();

      const response = await axios.post(`${API_URL}/login`, data);
      const result = response.data;

      console.log(result); // shows access_token, refresh_token, id_token, role

      // Save tokens
      localStorage.setItem("token", result.id_token);
      localStorage.setItem("accessToken", result.access_token);
      if (result.refresh_token)
        localStorage.setItem("refreshToken", result.refresh_token);
      if (result.role)
        localStorage.setItem("role", result.role);

      // Decode ID token to get user info
      const claims: any = jwtDecode(result.id_token);
      localStorage.setItem("username", claims["cognito:username"]);
      localStorage.setItem("userId", claims.sub);

      console.log("User logged in:", claims["cognito:username"]);

      return result;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  }

  async register(data: RegisterData) {
    try {
      const response = await axios.post(`${API_URL}/register`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  }

  logout() {
    localStorage.removeItem("token");
  }

  getToken() {
    return localStorage.getItem("token");
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  async getUserInfo() {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(`${API_URL}/users/${username}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user info"
      );
    }
  }
}

export default new AuthService();
