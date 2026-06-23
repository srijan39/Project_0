import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/order.model";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import asyncHandler from "../utils/asyncHandler";
import { pricingFromProduct } from "../utils/pricing";


const decrementVariantStock = async (
  productId: mongoose.Types.ObjectId,
  size: string | undefined,
  color: string | undefined,
  qty: number,
  session: mongoose.ClientSession
) =>
  Product.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          size: size ?? "",
          color: color ?? "",
          stock: { $gte: qty },
        },
      },
    },
    { $inc: { "variants.$.stock": -qty } },
    { new: true, session }
  );


const incrementVariantStock = async (
  productId: mongoose.Types.ObjectId | string,
  size: string | undefined,
  color: string | undefined,
  qty: number
) =>
  Product.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          size: size ?? "",
          color: color ?? "",
        },
      },
    },
    { $inc: { "variants.$.stock": qty } },
    { new: true }
  );


export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  const cart = await Cart.findOne({ user: req.user?._id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }


  for (const item of cart.items as any[]) {
    const product = item.product;

    if (!product || !product.variants || product.variants.length === 0) {
      continue;
    }

    const variantSize = item.size ?? "";
    const variantColor = item.color ?? "";

    const variant = product.variants.find(
      (v: { size: string; color: string; stock: number }) =>
        v.size === variantSize && v.color === variantColor
    );

    if (!variant) {
      res.status(400);
      throw new Error(
        `The variant you selected for "${product.name}"${item.size ? ` (Size: ${item.size})` : ""}${item.color ? ` (Color: ${item.color})` : ""} is no longer available. Please update your cart.`
      );
    }

    if (variant.stock < item.quantity) {
      const remaining = variant.stock;
      res.status(400);
      throw new Error(
        remaining === 0
          ? `"${product.name}"${item.size ? ` (Size: ${item.size})` : ""}${item.color ? ` (Color: ${item.color})` : ""} is out of stock. Please remove it from your cart.`
          : `Only ${remaining} unit${remaining === 1 ? "" : "s"} of "${product.name}"${item.size ? ` (Size: ${item.size})` : ""}${item.color ? ` (Color: ${item.color})` : ""} are available, but your cart has ${item.quantity}. Please update your cart.`
      );
    }
  }


  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const items = cart.items as any[];

    for (const item of items) {
      const product = item.product;

      if (!product.variants || product.variants.length === 0) {

        continue;
      }

      const decremented = await decrementVariantStock(
        product._id,
        item.size,
        item.color,
        item.quantity,
        session
      );

      if (!decremented) {

        await session.abortTransaction();
        res.status(409);
        throw new Error(
          `Stock for "${product.name}"${item.size ? ` (Size: ${item.size})` : ""}${item.color ? ` (Color: ${item.color})` : ""} changed while your order was being processed. Please refresh and try again.`
        );
      }
    }

    const orderItems = items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      name: item.product.name,
      image: item.product.image,
      price: pricingFromProduct(item.product).sellingPrice,
    }));

    const subtotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const shippingFee = 0;
    const totalAmount = subtotal + shippingFee;

    const [order] = await Order.create(
      [
        {
          user: req.user?._id,
          items: orderItems,
          shippingAddress,
          subtotal,
          shippingFee,
          totalAmount,
          status: "pending",
          paymentStatus: "pending",
        },
      ],
      { session }
    );

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    res.status(201).json({ success: true, data: order });
  } catch (error) {

    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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
  }
);

export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
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
  }
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


  const restorePromises = order.items.map((item) =>
    incrementVariantStock(
      item.product as mongoose.Types.ObjectId,
      item.size,
      item.color,
      item.quantity
    ).catch(() => null)
  );

  await Promise.all(restorePromises);

  res
    .status(200)
    .json({ success: true, message: "Order cancelled", data: order });
});
