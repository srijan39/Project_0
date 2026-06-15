import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} from "../controllers/wishlist.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// Get user's wishlist
router.get("/", protect, getWishlist);

// Add product to wishlist
router.post("/:productId", protect, addToWishlist);

// Remove product from wishlist
router.delete("/:productId", protect, removeFromWishlist);

// Check if product is wishlisted
router.get("/check/:productId", protect, checkWishlistStatus);

export default router;