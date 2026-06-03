import { createContext } from "react";
import type { Product } from "../data/products";

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
  addToCart: (product: Product, options?: AddToCartOptions) => void;
  removeFromCart: (id: number, size?: string, color?: string) => void;
  increaseQty: (id: number, size?: string, color?: string) => void;
  decreaseQty: (id: number, size?: string, color?: string) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
