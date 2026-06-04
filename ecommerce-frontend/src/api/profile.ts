import { apiRequest } from "./client";

interface ProfileResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
}

export const getProfile = async () => {
  const response = await apiRequest<ProfileResponse>("/auth/profile");
  return response.data;
};

