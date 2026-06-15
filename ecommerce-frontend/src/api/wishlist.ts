import { apiRequest } from "./client";
import { mapProduct } from "./products";
import type { BackendProduct } from "../types/product";

interface WishlistResponse {
  success: boolean;
  wishlist: BackendProduct[];
}

interface WishlistStatusResponse {
  success: boolean;
  isWishlisted: boolean;
}

export const getWishlist = async () => {
  const response = await apiRequest<WishlistResponse>("/wishlist");

  return (response.wishlist || []).map(mapProduct);
};

export const addToWishlist = async (productId: string) => {
  return apiRequest<{
    success: boolean;
    message: string;
  }>(`/wishlist/${productId}`, {
    method: "POST",
  });
};

export const removeFromWishlist = async (productId: string) => {
  return apiRequest<{
    success: boolean;
    message: string;
  }>(`/wishlist/${productId}`, {
    method: "DELETE",
  });
};

export const checkWishlistStatus = async (productId: string) => {
  const response = await apiRequest<WishlistStatusResponse>(
    `/wishlist/check/${productId}`
  );

  return response.isWishlisted;
};