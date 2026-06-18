import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  getWishlist,
  addToWishlist as addWishlistApi,
  removeFromWishlist as removeWishlistApi,
} from "../api/wishlist";

import type { Product } from "../types/product";

import { WishlistContext } from "./wishlist-context";

import { useAuth } from "../hooks/useAuth";

export const WishlistProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [wishlistState, setWishlistState] = useState<{
    userId: string | null;
    items: Product[];
  }>({
    userId: null,
    items: [],
  });

  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const wishlist =
    isAuthenticated &&
    user &&
    wishlistState.userId === user._id
      ? wishlistState.items
      : [];

  useEffect(() => {
    let isActive = true;

    if (authLoading) {
      return () => {
        isActive = false;
      };
    }

    if (!isAuthenticated || !user) {
      setWishlistState({
        userId: null,
        items: [],
      });

      return () => {
        isActive = false;
      };
    }

    getWishlist()
      .then((items) => {
        if (isActive) {
          setWishlistState({
            userId: user._id,
            items,
          });
        }
      })
      .catch(() => {
        if (isActive) {
          setWishlistState({
            userId: user._id,
            items: [],
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [
    authLoading,
    isAuthenticated,
    user,
  ]);

  const refreshWishlist = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const items = await getWishlist();

      setWishlistState({
        userId: user._id,
        items,
      });
    } catch {
      // ignore
    }
  };

  const addToWishlist = async (
    product: Product
  ) => {
    if (!isAuthenticated || !user) return;

    setWishlistState((current) => ({
      userId: user._id,
      items:
        current.userId === user._id
          ? [...current.items, product]
          : [product],
    }));

    try {
      await addWishlistApi(product.id);
    } catch {
      refreshWishlist();
    }
  };

  const removeFromWishlist = async (
    productId: string
  ) => {
    if (!isAuthenticated || !user) return;

    setWishlistState((current) => ({
      userId: user._id,
      items:
        current.userId === user._id
          ? current.items.filter(
              (item) => item.id !== productId
            )
          : [],
    }));

    try {
      await removeWishlistApi(productId);
    } catch {
      refreshWishlist();
    }
  };

  const isWishlisted = (
    productId: string
  ) => {
    return wishlist.some(
      (item) => item.id === productId
    );
  };

  const toggleWishlist = async (
    product: Product
  ) => {
    if (isWishlisted(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading: authLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};