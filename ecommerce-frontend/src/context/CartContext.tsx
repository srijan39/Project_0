import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
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

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, options?: AddToCartOptions) => {
    const size = options?.size;
    const color = options?.color;
    const quantity = options?.quantity ?? 1;

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.size === size &&
          item.color === color
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id &&
          item.size === size &&
          item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity,
          size,
          color,
        },
      ];
    });
  };

  const removeFromCart = (id: number, size?: string, color?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.size === size &&
            item.color === color
          )
      )
    );
  };

  const increaseQty = (id: number, size?: string, color?: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.size === size &&
        item.color === color
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id: number, size?: string, color?: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id &&
          item.size === size &&
          item.color === color
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};