import { Router } from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controllers/cart.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect, getCart);

router.post("/", protect, addToCart);

router.delete("/:productId", protect, removeFromCart);

export default router;