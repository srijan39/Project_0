import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../api/cart";
import type { Product } from "../types/product";
import { CartContext } from "./cart-context";
import type { AddToCartOptions, CartItem } from "./cart-context";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    let isActive = true;

    getCart()
      .then((items) => {
        if (isActive) {
          setCart(items);
        }
      })
      .catch(() => {
        if (isActive) {
          setCart((current) => current);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const syncCart = (request: Promise<CartItem[]>) => {
    request
      .then((items) => setCart(items))
      .catch(() => {
        setCart((current) => current);
      });
  };

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

    syncCart(addCartItem(product.id, quantity, size, color));
  };

  const removeFromCart = (id: string, size?: string, color?: string) => {
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

    syncCart(removeCartItem(id, size, color));
  };

  const increaseQty = (id: string, size?: string, color?: string) => {
    const currentItem = cart.find(
      (item) =>
        item.id === id &&
        item.size === size &&
        item.color === color
    );
    const nextQuantity = (currentItem?.quantity || 0) + 1;

    setCart((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.size === size &&
        item.color === color
          ? { ...item, quantity: nextQuantity }
          : item
      )
    );

    syncCart(updateCartItem(id, nextQuantity, size, color));
  };

  const decreaseQty = (id: string, size?: string, color?: string) => {
    const currentItem = cart.find(
      (item) =>
        item.id === id &&
        item.size === size &&
        item.color === color
    );
    const nextQuantity = Math.max(0, (currentItem?.quantity || 0) - 1);

    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id &&
          item.size === size &&
          item.color === color
            ? { ...item, quantity: nextQuantity }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    syncCart(updateCartItem(id, nextQuantity, size, color));
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
