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
import { useAuth } from "../hooks/useAuth";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartState, setCartState] = useState<{
    userId: string | null;
    items: CartItem[];
  }>({
    userId: null,
    items: [],
  });
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const cart =
    isAuthenticated && user && cartState.userId === user._id
      ? cartState.items
      : [];

  useEffect(() => {
    let isActive = true;

    if (authLoading) {
      return () => {
        isActive = false;
      };
    }

    if (!isAuthenticated || !user) {
      return () => {
        isActive = false;
      };
    }

    getCart()
      .then((items) => {
        if (isActive) {
          setCartState({
            userId: user._id,
            items,
          });
        }
      })
      .catch(() => {
        if (isActive) {
          setCartState((current) => current);
        }
      });

    return () => {
      isActive = false;
    };
  }, [authLoading, isAuthenticated, user]);

  const syncCart = (request: Promise<CartItem[]>) => {
    if (!isAuthenticated || !user) return;

    request
      .then((items) =>
        setCartState({
          userId: user._id,
          items,
        })
      )
      .catch(() => {
        setCartState((current) => current);
      });
  };

  const addToCart = (product: Product, options?: AddToCartOptions) => {
    if (!isAuthenticated || !user) return;

    const size = options?.size;
    const color = options?.color;
    const quantity = options?.quantity ?? 1;

    setCartState((current) => {
      const prev = current.userId === user._id ? current.items : [];
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.size === size &&
          item.color === color
      );

      if (existing) {
        return {
          userId: user._id,
          items: prev.map((item) =>
            item.id === product.id &&
            item.size === size &&
            item.color === color
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        userId: user._id,
        items: [
          ...prev,
          {
            ...product,
            quantity,
            size,
            color,
          },
        ],
      };
    });

    syncCart(addCartItem(product.id, quantity, size, color));
  };

  const removeFromCart = (id: string, size?: string, color?: string) => {
    if (!isAuthenticated || !user) return;

    if (user) {
      setCartState((current) => ({
        userId: user._id,
        items:
          current.userId === user._id
            ? current.items.filter(
                (item) =>
                  !(
                    item.id === id &&
                    item.size === size &&
                    item.color === color
                  )
              )
            : [],
      }));
    }

    syncCart(removeCartItem(id, size, color));
  };

  const increaseQty = (id: string, size?: string, color?: string) => {
    if (!isAuthenticated || !user) return;

    const currentItem = cart.find(
      (item) =>
        item.id === id &&
        item.size === size &&
        item.color === color
    );
    const nextQuantity = (currentItem?.quantity || 0) + 1;

    if (user) {
      setCartState((current) => ({
        userId: user._id,
        items:
          current.userId === user._id
            ? current.items.map((item) =>
                item.id === id &&
                item.size === size &&
                item.color === color
                  ? { ...item, quantity: nextQuantity }
                  : item
              )
            : [],
      }));
    }

    syncCart(updateCartItem(id, nextQuantity, size, color));
  };

  const decreaseQty = (id: string, size?: string, color?: string) => {
    if (!isAuthenticated || !user) return;

    const currentItem = cart.find(
      (item) =>
        item.id === id &&
        item.size === size &&
        item.color === color
    );
    const nextQuantity = Math.max(0, (currentItem?.quantity || 0) - 1);

    if (user) {
      setCartState((current) => ({
        userId: user._id,
        items:
          current.userId === user._id
            ? current.items
                .map((item) =>
                  item.id === id &&
                  item.size === size &&
                  item.color === color
                    ? { ...item, quantity: nextQuantity }
                    : item
                )
                .filter((item) => item.quantity > 0)
            : [],
      }));
    }

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
