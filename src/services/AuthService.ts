import axios from "axios";

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
      const response = await axios.post(`${API_URL}/login`, data);
      localStorage.setItem("token", response.data.AccessToken);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
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
}

export default new AuthService();
