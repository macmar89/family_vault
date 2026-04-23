import api from "../../../lib/axios";
import { LoginRequest } from "../types/auth";

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
};
