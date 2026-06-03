import { useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../data/products";
import { CartContext } from "./cart-context";
import type { AddToCartOptions, CartItem } from "./cart-context";

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
