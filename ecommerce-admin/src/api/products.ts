import api from "./axios";

export interface ProductListParams {
  page?: number;
  limit?: number;
}

export const getProducts = async (params: ProductListParams = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
