import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/order.model";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import type { IProduct, IProductVariant } from "../models/product.model";
import asyncHandler from "../utils/asyncHandler";
import { pricingFromProduct } from "../utils/pricing";

interface PopulatedCartItem {
  product: IProduct;
  quantity: number;
  color: string;
  size: string;
}

const findVariant = (
  variants: IProductVariant[],
  color: string,
  size: string
): IProductVariant | undefined =>
  variants.find((v) => v.color === color && v.size === size);

const decrementVariantStock = async (
  productId: mongoose.Types.ObjectId,
  color: string,
  size: string,
  qty: number,
  session: mongoose.ClientSession
) =>
  Product.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          color,
          size,
          stock: { $gte: qty },
        },
      },
    },
    { $inc: { "variants.$.stock": -qty } },
    { new: true, session }
  );

const incrementVariantStock = async (
  productId: mongoose.Types.ObjectId | string,
  color: string,
  size: string,
  qty: number
) =>
  Product.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          color,
          size,
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

  const populatedItems = cart.items as unknown as PopulatedCartItem[];

  for (const item of populatedItems) {
    const product = item.product;

    if (!product) {
      res.status(400);
      throw new Error(
        "A product in your cart is no longer available. Please update your cart."
      );
    }

    if (product.variants.length === 0) {
      res.status(400);
      throw new Error(
        `"${product.name}" has no available variants. Please remove it from your cart.`
      );
    }

    const variant = findVariant(product.variants, item.color, item.size);

    if (!variant) {
      res.status(400);
      throw new Error(
        `The variant you selected for "${product.name}" (Color: ${item.color}, Size: ${item.size}) is no longer available. Please update your cart.`
      );
    }

    if (variant.stock < item.quantity) {
      const remaining = variant.stock;
      res.status(400);
      throw new Error(
        remaining === 0
          ? `"${product.name}" (${item.color}/${item.size}) is out of stock. Please remove it from your cart.`
          : `Only ${remaining} unit${remaining === 1 ? "" : "s"} of "${product.name}" (${item.color}/${item.size}) available, but your cart has ${item.quantity}. Please update your cart.`
      );
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of populatedItems) {
      const decremented = await decrementVariantStock(
        item.product._id as mongoose.Types.ObjectId,
        item.color,
        item.size,
        item.quantity,
        session
      );

      if (!decremented) {
        await session.abortTransaction();
        res.status(409);
        throw new Error(
          `Stock for "${item.product.name}" (${item.color}/${item.size}) changed while your order was being processed. Please refresh and try again.`
        );
      }
    }

    const orderItems = populatedItems.map((item) => ({
      product: item.product._id as mongoose.Types.ObjectId,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
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
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
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
      item.color ?? "",
      item.size ?? "",
      item.quantity
    ).catch(() => null)
  );

  await Promise.all(restorePromises);

  res
    .status(200)
    .json({ success: true, message: "Order cancelled", data: order });
});
