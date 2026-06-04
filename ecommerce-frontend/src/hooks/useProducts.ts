import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import type { Product, ProductCategory } from "../types/product";

interface UseProductsOptions {
  category?: ProductCategory;
  limit?: number;
}

export const useProducts = ({ category, limit }: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    setLoading(true);
    setError("");

    getProducts({ category, limit })
      .then((data) => {
        if (isActive) {
          setProducts(data);
        }
      })
      .catch((error) => {
        if (isActive) {
          setError(error instanceof Error ? error.message : "Unable to load products");
          setProducts([]);
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
  }, [category, limit]);

  return { products, loading, error };
};

