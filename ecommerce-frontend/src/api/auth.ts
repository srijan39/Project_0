import { apiRequest } from "./client";
import type { StoredUser } from "./client";

export type UserRole = StoredUser["role"];

export type AuthUser = StoredUser;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

interface ProfileResponse {
  success: boolean;
  data: AuthUser;
}

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    auth: false,
  });

  return response;
};

export const registerUser = async (payload: RegisterPayload) => {
  const response = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });

  return response;
};

export const getCurrentUser = async () => {
  const response = await apiRequest<ProfileResponse>("/auth/profile");
  return response.data;
};
