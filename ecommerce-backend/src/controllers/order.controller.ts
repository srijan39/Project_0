import { Request, Response } from "express";
import Order from "../models/order.model";
import Cart from "../models/cart.model";
import asyncHandler from "../utils/asyncHandler";
import { pricingFromProduct } from "../utils/pricing";
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }
  const cart = await Cart.findOne({ user: req.user?._id }).populate(
    "items.product",
  );
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }
  const items = cart.items.map((item: any) => ({
    product: item.product._id,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    name: item.product.name,
    image: item.product.image,
    price: pricingFromProduct(item.product).sellingPrice,
  }));
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingFee = 0;
  const totalAmount = subtotal + shippingFee;
  const order = await Order.create({
    user: req.user?._id,
    items,
    shippingAddress,
    subtotal,
    shippingFee,
    totalAmount,
    status: "pending",
    paymentStatus: "pending",
  });
  cart.items = [];
  await cart.save();
  res.status(201).json({ success: true, data: order });
});
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user?._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, count: orders.length, data: orders });
});
export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    const isOwner =
      order.user && order.user._id?.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error("Access denied");
    }
    res.status(200).json({ success: true, data: order });
  },
);
export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  },
);
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.body;
    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.status === "cancelled") {
      res.status(400);
      throw new Error("Cancelled orders cannot be updated");
    }
    order.status = status;
    await order.save();
    res.status(200).json({ success: true, data: order });
  },
);
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const isOwner = order.user.toString() === req.user?._id.toString();
  const isAdmin = req.user?.role === "admin";
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Access denied");
  }
  if (order.status === "delivered") {
    res.status(400);
    throw new Error("Delivered orders cannot be cancelled");
  }
  if (order.status === "cancelled") {
    res.status(400);
    throw new Error("Order is already cancelled");
  }
  order.status = "cancelled";
  await order.save();
  res
    .status(200)
    .json({ success: true, message: "Order cancelled", data: order });
});
