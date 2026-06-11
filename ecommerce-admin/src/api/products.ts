import api from "./axios";
import type { ProductInput } from "../types/product";

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getProducts = async (params: ProductListParams = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: ProductInput) => {
  const response = await api.post("/products", product);
  return response.data;
};

export const updateProduct = async (id: string, product: ProductInput) => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const createProductsBulk = async (products: ProductInput[]) => {
  const response = await api.post("/products/bulk", products);
  return response.data;
};
