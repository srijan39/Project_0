import { apiRequest } from "./client";
import { mapProduct } from "./products";
import type { CartItem } from "../context/cart-context";
import type { BackendProduct } from "../types/product";

interface BackendCartItem {
  product: BackendProduct;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartResponse {
  success: boolean;
  data: {
    items: BackendCartItem[];
  } | null;
}

const mapCartItems = (response: CartResponse): CartItem[] =>
  (response.data?.items || []).map((item) => ({
    ...mapProduct(item.product),
    quantity: item.quantity,
    size: item.size,
    color: item.color,
  }));

const variantParams = (size?: string, color?: string) => {
  const params = new URLSearchParams();

  if (size) params.set("size", size);
  if (color) params.set("color", color);

  return params.toString();
};

export const getCart = async () => {
  const response = await apiRequest<CartResponse>("/cart");
  return mapCartItems(response);
};

export const addCartItem = async (
  productId: string,
  quantity: number,
  size?: string,
  color?: string
) => {
  const response = await apiRequest<CartResponse>("/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity, size, color }),
  });

  return mapCartItems(response);
};

export const updateCartItem = async (
  productId: string,
  quantity: number,
  size?: string,
  color?: string
) => {
  const response = await apiRequest<CartResponse>(`/cart/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity, size, color }),
  });

  return mapCartItems(response);
};

export const removeCartItem = async (
  productId: string,
  size?: string,
  color?: string
) => {
  const query = variantParams(size, color);
  const response = await apiRequest<CartResponse>(
    `/cart/${productId}${query ? `?${query}` : ""}`,
    {
      method: "DELETE",
    }
  );

  return mapCartItems(response);
};

