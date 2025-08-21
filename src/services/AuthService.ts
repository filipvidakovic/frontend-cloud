import axios from "axios";

export interface LoginData {
  email: string;
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
      console.log(response.data);
      // Save JWT token to localStorage (or cookies)
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  async register(data: RegisterData) {
    try {
      const response = await axios.post(`${API_URL}/register`, data);
      console.log(response.data);
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
