import api from "./axios";

export interface UploadImageResponse {
  success: boolean;
  url: string;
  publicId: string;
}

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post<UploadImageResponse>("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
