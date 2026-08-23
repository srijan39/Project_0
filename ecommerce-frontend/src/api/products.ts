import { apiRequest } from "./client";
import type { BackendProduct, Product, ProductCategory, ProductVariant } from "../types/product";
import { normalizeProductPricing } from "../utils/pricing";

export type ProductSort =
  | "price_asc"
  | "price_desc"
  | "newest"
  | "oldest"
  | "discount_desc";

export type ProductDiscountFilter =
  | "on_sale"
  | "10"
  | "20"
  | "30"
  | "50";

export interface ProductQuery {
  category?: ProductCategory;
  color?: string[];
  size?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  discount?: ProductDiscountFilter;
  page?: number;
  limit?: number;
  search?: string;
  sort?: ProductSort;
}

export interface ProductPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalProducts: number;
}

export interface ProductFilterOptions {
  categories: ProductCategory[];
  colors: string[];
  sizes: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
}

interface ProductsResponse extends ProductPagination {
  success: boolean;
  data: BackendProduct[];
  availableFilters?: ProductFilterOptions;
}

interface ProductResponse {
  success: boolean;
  data: BackendProduct;
}

const deriveColorsFromVariants = (variants: ProductVariant[]): string[] =>
  [...new Set(variants.map((v) => v.color))];

const deriveSizesFromVariants = (variants: ProductVariant[]): string[] =>
  [...new Set(variants.map((v) => v.size))];

export const mapProduct = (product: BackendProduct): Product => {
  const pricing = normalizeProductPricing(product);
  const variants = product.variants ?? [];

  return {
    id: product._id,
    name: product.name,
    category: product.category,
    ...pricing,
    image: product.image,
    images: product.images?.length ? product.images : [product.image],
    description: product.description,
    sizes: product.sizes?.length ? product.sizes : deriveSizesFromVariants(variants),
    colors: product.colors?.length ? product.colors : deriveColorsFromVariants(variants),
    features: product.features || [],
    variants,
  };
};

export const getProductsPage = async (query: ProductQuery = {}) => {
  const params = new URLSearchParams({
    limit: String(query.limit || 12),
  });

  if (query.page) params.set("page", String(query.page));
  if (query.category) params.set("category", query.category);
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.color?.length) params.set("color", query.color.join(","));
  if (query.size?.length) params.set("size", query.size.join(","));
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.inStock) params.set("inStock", "true");
  if (query.discount) params.set("discount", query.discount);
  if (query.sort) params.set("sort", query.sort);

  const response = await apiRequest<ProductsResponse>(
    `/products?${params.toString()}`,
    { auth: false }
  );

  return {
    products: response.data.map(mapProduct),
    pagination: {
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      totalProducts: response.totalProducts,
    },
    availableFilters: response.availableFilters ?? {
      categories: ["men", "women", "kids"],
      colors: [],
      sizes: [],
      priceRange: {
        min: null,
        max: null,
      },
    },
  };
};

export const getProducts = async (query: ProductQuery = {}) => {
  const response = await getProductsPage({
    ...query,
    limit: query.limit ?? 100,
  });

  return response.products;
};

export const getFeaturedProducts = async () =>
  getProducts({ limit: 8, sort: "newest" });

export const getProductById = async (id: string) => {
  const response = await apiRequest<ProductResponse>(`/products/${id}`, {
    auth: false,
  });

  return mapProduct(response.data);
};
