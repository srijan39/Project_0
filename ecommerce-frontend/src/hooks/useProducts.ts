import { useEffect, useState } from "react";
import {
  getProductsPage,
  type ProductDiscountFilter,
  type ProductFilterOptions,
  type ProductPagination,
  type ProductSort,
} from "../api/products";
import type {
  Product,
  ProductCategory,
} from "../types/product";

interface UseProductsOptions {
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

export const useProducts = ({
  category,
  color,
  size,
  minPrice,
  maxPrice,
  inStock,
  discount,
  page,
  limit,
  search,
  sort,
}: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState<ProductPagination>({
    page: 1,
    limit: limit || 12,
    totalPages: 1,
    totalProducts: 0,
  });

  const [availableFilters, setAvailableFilters] =
    useState<ProductFilterOptions>({
      categories: ["kids", "men", "women"],
      colors: [],
      sizes: [],
      priceRange: {
        min: null,
        max: null,
      },
    });

  const colorKey = color?.join(",") ?? "";
  const sizeKey = size?.join(",") ?? "";

  useEffect(() => {
    let isActive = true;

    Promise.resolve()
      .then(() => {
        if (isActive) {
          setLoading(true);
          setError("");
        }

        return getProductsPage({
          category,
          color: colorKey ? colorKey.split(",") : undefined,
          size: sizeKey ? sizeKey.split(",") : undefined,
          minPrice,
          maxPrice,
          inStock,
          discount,
          page,
          limit,
          search,
          sort,
        });
      })
      .then((data) => {
        if (isActive) {
          setProducts(data.products);
          setPagination(data.pagination);
          setAvailableFilters(data.availableFilters);
        }
      })
      .catch((error) => {
        if (isActive) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load products"
          );

          setProducts([]);
          setPagination((current) => ({
            ...current,
            totalPages: 1,
            totalProducts: 0,
          }));
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [
    category,
    colorKey,
    sizeKey,
    minPrice,
    maxPrice,
    inStock,
    discount,
    page,
    limit,
    search,
    sort,
  ]);

  return {
    products,
    loading,
    error,
    pagination,
    availableFilters,
  };
};
