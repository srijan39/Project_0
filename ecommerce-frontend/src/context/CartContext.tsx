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

const variantKey = (id: string, size?: string, color?: string) =>
  `${id}|${size ?? ""}|${color ?? ""}`;

const variantStock = (item: CartItem): number | null => {
  if (!item.variants || item.variants.length === 0) return null;
  const v = item.variants.find(
    (v) => v.size === (item.size ?? "") && v.color === (item.color ?? "")
  );
  return v?.stock ?? null;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartState, setCartState] = useState<{
    userId: string | null;
    items: CartItem[];
  }>({
    userId: null,
    items: [],
  });
  const [stockWarnings, setStockWarnings] = useState<Record<string, string>>({});
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const cart =
    isAuthenticated && user && cartState.userId === user._id
      ? cartState.items
      : [];

  const setWarning = (key: string, message: string) =>
    setStockWarnings((prev) => ({ ...prev, [key]: message }));

  const clearWarning = (key: string) =>
    setStockWarnings((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

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
        if (!isActive) return;

        const warnings: Record<string, string> = {};

        const clamped = items.map((item) => {
          const stock = variantStock(item);
          if (stock === null) return item;

          if (stock === 0) {
            warnings[variantKey(item.id, item.size, item.color)] =
              "This item is now out of stock";
            return { ...item, quantity: 0 };
          }

          if (item.quantity > stock) {
            warnings[variantKey(item.id, item.size, item.color)] =
              `Only ${stock} left — quantity adjusted`;
            return { ...item, quantity: stock };
          }

          return item;
        }).filter((item) => item.quantity > 0);

        setCartState({ userId: user._id, items: clamped });
        setStockWarnings(warnings);
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
    const key = variantKey(product.id, size, color);

    setCartState((current) => {
      const prev = current.userId === user._id ? current.items : [];
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.size === size &&
          item.color === color
      );

      const currentQty = existing?.quantity ?? 0;
      const stock = variantStock({ ...product, quantity: 0, size, color } as CartItem);

      if (stock !== null) {
        const total = currentQty + quantity;
        if (total > stock) {
          const allowed = Math.max(0, stock - currentQty);
          if (allowed === 0) {
            setWarning(key, stock === 0 ? "This item is out of stock" : "You already have the maximum available quantity in your cart");
            return current;
          }
          setWarning(key, `Only ${stock} available — ${allowed} added`);

          if (existing) {
            return {
              userId: user._id,
              items: prev.map((item) =>
                item.id === product.id && item.size === size && item.color === color
                  ? { ...item, quantity: stock }
                  : item
              ),
            };
          }

          return {
            userId: user._id,
            items: [...prev, { ...product, quantity: allowed, size, color }],
          };
        }
      }

      clearWarning(key);

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

    clearWarning(variantKey(id, size, color));

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

    const key = variantKey(id, size, color);
    const currentItem = cart.find(
      (item) =>
        item.id === id &&
        item.size === size &&
        item.color === color
    );

    if (!currentItem) return;

    const stock = variantStock(currentItem);
    const nextQuantity = currentItem.quantity + 1;

    if (stock !== null && nextQuantity > stock) {
      setWarning(key, `Only ${stock} unit${stock === 1 ? "" : "s"} available`);
      return;
    }

    clearWarning(key);

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
        stockWarnings,
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
