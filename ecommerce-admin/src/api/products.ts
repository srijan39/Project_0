import api from "./axios";

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};