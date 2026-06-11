import { apiRequest } from "./client";
import type { BackendProduct, Product, ProductCategory } from "../types/product";

interface ProductsResponse {
  success: boolean;
  data: BackendProduct[];
}

interface ProductResponse {
  success: boolean;
  data: BackendProduct;
}

interface ProductQuery {
  category?: ProductCategory;
  limit?: number;
  search?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "oldest";
}

export const mapProduct = (product: BackendProduct): Product => ({
  id: product._id,
  name: product.name,
  category: product.category,
  price: product.price,
  image: product.image,
  images: product.images?.length ? product.images : [product.image],
  description: product.description,
  sizes: product.sizes || [],
  colors: product.colors ?? [],
  features: product.features || [],
});

export const getProducts = async (query: ProductQuery = {}) => {
  const params = new URLSearchParams({
    limit: String(query.limit || 100),
  });

  if (query.category) params.set("category", query.category);
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.sort) params.set("sort", query.sort);

  const response = await apiRequest<ProductsResponse>(
    `/products?${params.toString()}`,
    { auth: false }
  );

  return response.data.map(mapProduct);
};

export const getFeaturedProducts = async () =>
  getProducts({ limit: 8, sort: "newest" });

export const getProductById = async (id: string) => {
  const response = await apiRequest<ProductResponse>(`/products/${id}`, {
    auth: false,
  });

  return mapProduct(response.data);
};
