import { createContext } from "react";
import type { Product } from "../types/product";

export interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  loading: boolean;

  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

export const WishlistContext =
  createContext<WishlistContextType | undefined>(
    undefined
  );