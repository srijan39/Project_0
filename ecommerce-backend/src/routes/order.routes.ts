import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
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

// Create Order
router.post(
  "/",
  protect,
  createOrder
);

// Get Logged-in User Orders
router.get(
  "/my-orders",
  protect,
  getMyOrders
);

// Cancel Order
router.put(
  "/:id/cancel",
  protect,
  cancelOrder
);

/*
 * Admin Routes
 */

// Get All Orders
router.get(
  "/admin/all",
  protect,
  admin,
  getAllOrders
);

// Update Order Status
router.put(
  "/admin/:id/status",
  protect,
  admin,
  updateOrderStatus
);

/*
 * Dynamic Routes
 * Keep these LAST
 */

// Get Single Order
router.get(
  "/:id",
  protect,
  getOrderById
);

export default router;