import express from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/order.controller";

import {
  protect,
  admin,
} from "../middleware/auth.middleware";

const router = express.Router();

/*
 * User Routes
 */

router.post("/", protect, createOrder);

router.get("/", protect, getOrders);

router.get("/:id", protect, getOrderById);

router.delete("/:id", protect, cancelOrder);

/*
 * Admin Routes
 */

router.put(
  "/:id/status",
  protect,
  admin,
  updateOrderStatus
);

export default router;