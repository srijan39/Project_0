import { createContext } from "react";
import type { Product } from "../types/product";

export interface CartItem extends Product {
  quantity: number;
  size?: string;
  color?: string;
}

export interface AddToCartOptions {
  size?: string;
  color?: string;
  quantity?: number;
}

export interface CartContextType {
  cart: CartItem[];
  stockWarnings: Record<string, string>;
  addToCart: (product: Product, options?: AddToCartOptions) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  increaseQty: (id: string, size?: string, color?: string) => void;
  decreaseQty: (id: string, size?: string, color?: string) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
