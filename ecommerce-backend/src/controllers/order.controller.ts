import { Request, Response } from "express";
import mongoose from "mongoose";

import Order from "../models/order.model";
import Cart from "../models/cart.model";

import asyncHandler from "../utils/asyncHandler";

export const createOrder = asyncHandler(
async (req: Request, res: Response) => {
const cart = await Cart.findOne({
user: req.user?._id,
}).populate("items.product");


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
  price: item.product.price,
}));

const subtotal = items.reduce(
  (total, item) =>
    total + item.price * item.quantity,
  0
);

const shippingFee = 0;

const totalAmount = subtotal + shippingFee;

const order = await Order.create({
  user: req.user?._id,

  items,

  subtotal,
  shippingFee,
  totalAmount,

  status: "pending",
  paymentStatus: "pending",
});

cart.items = [];
await cart.save();

res.status(201).json({
  success: true,
  data: order,
});


}
);

export const getOrders = asyncHandler(
async (req: Request, res: Response) => {
const orders = await Order.find({
user: req.user?._id,
}).sort({
createdAt: -1,
});


res.status(200).json({
  success: true,
  count: orders.length,
  data: orders,
});


}
);

export const getOrderById = asyncHandler(
async (req: Request, res: Response) => {
const order = await Order.findById(
req.params.id
);


if (!order) {
  res.status(404);
  throw new Error("Order not found");
}

const isOwner =
  order.user.toString() ===
  req.user?._id.toString();

const isAdmin =
  req.user?.role === "admin";

if (!isOwner && !isAdmin) {
  res.status(403);
  throw new Error("Access denied");
}

res.status(200).json({
  success: true,
  data: order,
});


}
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

if (
  !allowedStatuses.includes(status)
) {
  res.status(400);
  throw new Error("Invalid status");
}

const order = await Order.findById(
  req.params.id
);

if (!order) {
  res.status(404);
  throw new Error("Order not found");
}

order.status = status;

await order.save();

res.status(200).json({
  success: true,
  data: order,
});

}
);

export const cancelOrder = asyncHandler(
async (req: Request, res: Response) => {
const order = await Order.findById(
req.params.id
);


if (!order) {
  res.status(404);
  throw new Error("Order not found");
}

const isOwner =
  order.user.toString() ===
  req.user?._id.toString();

const isAdmin =
  req.user?.role === "admin";

if (!isOwner && !isAdmin) {
  res.status(403);
  throw new Error("Access denied");
}

order.status = "cancelled";

await order.save();

res.status(200).json({
  success: true,
  message: "Order cancelled",
  data: order,
});


}
);
