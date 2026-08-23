import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/order.model";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import type { IProduct } from "../models/product.model";
import asyncHandler from "../utils/asyncHandler";
import { pricingFromProduct } from "../utils/pricing";
import {
  decrementVariantStock,
  findVariant,
  incrementVariantStock,
  InventoryError,
  normalizeVariantField,
  validateVariantSelection,
} from "../utils/inventory";

interface PopulatedCartItem {
  product: IProduct;
  quantity: number;
  color: string;
  size: string;
}

interface OrderRequestItem {
  productId?: unknown;
  quantity?: unknown;
  color?: unknown;
  size?: unknown;
}

interface InventoryRequest {
  productId: mongoose.Types.ObjectId;
  productName: string;
  color: string;
  size: string;
  quantity: number;
}

const getDocumentId = (document: { _id: unknown }) =>
  document._id as mongoose.Types.ObjectId;

const normalizeParam = (value: unknown) =>
  Array.isArray(value) ? value[0] : String(value || "");

const normalizeOrderRequestItems = async (
  items: unknown[]
): Promise<PopulatedCartItem[]> => {
  const populatedItems: PopulatedCartItem[] = [];

  for (const item of items) {
    const requestItem = item as OrderRequestItem;
    const productId = normalizeParam(requestItem.productId);
    const quantity = Number(requestItem.quantity);
    const color = normalizeVariantField(requestItem.color);
    const size = normalizeVariantField(requestItem.size);

    if (!mongoose.isValidObjectId(productId)) {
      throw new InventoryError("Invalid product in checkout", 400);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new InventoryError("Quantity must be a whole number greater than 0", 400);
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new InventoryError("A product in checkout is no longer available", 404);
    }

    populatedItems.push({
      product,
      quantity,
      color,
      size,
    });
  }

  return populatedItems;
};

const buildInventoryRequests = (
  items: PopulatedCartItem[]
): InventoryRequest[] => {
  const requests = new Map<string, InventoryRequest>();

  for (const item of items) {
    const productId = getDocumentId(item.product);
    const key = `${productId.toString()}|${item.color}|${item.size}`;
    const existing = requests.get(key);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      requests.set(key, {
        productId,
        productName: item.product.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      });
    }
  }

  return [...requests.values()];
};

const getCartVersion = (cart: unknown) =>
  typeof (cart as { __v?: unknown }).__v === "number"
    ? (cart as { __v: number }).__v
    : 0;

const restoreOrderInventory = async (
  order: {
    _id: unknown;
    items: {
      product: mongoose.Types.ObjectId;
      color?: string;
      size?: string;
      quantity: number;
    }[];
  },
  session: mongoose.ClientSession
) => {
  for (const item of order.items) {
    if (!item.color || !item.size) {
      throw new InventoryError(
        "Order contains an item without a variant snapshot",
        409
      );
    }

    const restored = await incrementVariantStock(
      item.product,
      item.color,
      item.size,
      item.quantity,
      session
    );

    if (!restored) {
      throw new InventoryError(
        "Order stock could not be restored because a variant is missing",
        409
      );
    }
  }
};

const cancelOrderWithInventory = async (
  orderId: string,
  userId: mongoose.Types.ObjectId | undefined,
  isAdmin: boolean
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new InventoryError("Order not found", 404);
    }

    const isOwner = order.user.toString() === userId?.toString();

    if (!isOwner && !isAdmin) {
      throw new InventoryError("Access denied", 403);
    }

    if (order.status === "delivered") {
      throw new InventoryError("Delivered orders cannot be cancelled");
    }

    if (order.status === "cancelled") {
      throw new InventoryError("Order is already cancelled");
    }

    const statusResult = await Order.updateOne(
      { _id: order._id, status: order.status },
      { $set: { status: "cancelled" } },
      { session }
    );

    if (statusResult.modifiedCount !== 1) {
      throw new InventoryError(
        "Order status changed while cancellation was being processed",
        409
      );
    }

    await restoreOrderInventory(order, session);
    await session.commitTransaction();

    const cancelledOrder = await Order.findById(orderId);

    if (!cancelledOrder) {
      throw new InventoryError("Order not found", 404);
    }

    return cancelledOrder;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    session.endSession();
  }
};

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const addressId = normalizeParam(req.body.addressId);
  const requestItems = Array.isArray(req.body.items) ? req.body.items : null;
  const isBuyNowOrder = requestItems !== null && requestItems.length > 0;

  if (!addressId || !mongoose.isValidObjectId(addressId)) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  const user = req.user;
  const selectedAddress = user?.addresses.id(addressId);

  if (!user || !selectedAddress) {
    res.status(404);
    throw new Error("Shipping address not found");
  }

  const shippingAddress = {
    fullName: selectedAddress.fullName,
    phone: selectedAddress.phone,
    addressLine1: selectedAddress.addressLine1,
    addressLine2: selectedAddress.addressLine2,
    city: selectedAddress.city,
    state: selectedAddress.state,
    postalCode: selectedAddress.pincode,
    country: selectedAddress.country,
  };

  const cart = isBuyNowOrder
    ? null
    : await Cart.findOne({ user: req.user?._id }).populate("items.product");

  if (!isBuyNowOrder && (!cart || cart.items.length === 0)) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const populatedItems = isBuyNowOrder
    ? await normalizeOrderRequestItems(requestItems)
    : (cart!.items as unknown as PopulatedCartItem[]);

  for (const item of populatedItems) {
    const product = item.product;

    if (!product) {
      res.status(400);
      throw new Error(
        "A product in checkout is no longer available. Please update and try again."
      );
    }

    try {
      validateVariantSelection(product, item.color, item.size, item.quantity);
    } catch (error) {
      if (error instanceof InventoryError) {
        res.status(error.statusCode);
        throw new Error(
          `${error.message}. Please update and try again.`
        );
      }

      throw error;
    }
  }

  for (const request of buildInventoryRequests(populatedItems)) {
    const item = populatedItems.find(
      (cartItem) =>
        getDocumentId(cartItem.product).toString() ===
          request.productId.toString() &&
        cartItem.color === request.color &&
        cartItem.size === request.size
    );

    if (!item) {
      res.status(400);
      throw new Error("Checkout contains an invalid variant selection");
    }

    const variant = findVariant(item.product.variants, request.color, request.size);

    if (!variant || variant.stock < request.quantity) {
      const remaining = variant?.stock ?? 0;
      res.status(400);
      throw new Error(
        remaining === 0
          ? `"${request.productName}" (${request.color}/${request.size}) is out of stock. Please update and try again.`
          : `Only ${remaining} unit${remaining === 1 ? "" : "s"} of "${request.productName}" (${request.color}/${request.size}) available, but checkout has ${request.quantity}. Please update and try again.`
      );
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of buildInventoryRequests(populatedItems)) {
      const decremented = await decrementVariantStock(
        item.productId,
        item.color,
        item.size,
        item.quantity,
        session
      );

      if (!decremented) {
        await session.abortTransaction();
        res.status(409);
        throw new Error(
          `Stock for "${item.productName}" (${item.color}/${item.size}) changed while your order was being processed. Please refresh and try again.`
        );
      }
    }

    const orderItems = populatedItems.map((item) => ({
      product: getDocumentId(item.product),
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      variantSnapshot: {
        color: item.color,
        size: item.size,
      },
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

    if (!isBuyNowOrder && cart) {
      const clearCartResult = await Cart.updateOne(
        { _id: cart._id, user: req.user?._id, __v: getCartVersion(cart) },
        { $set: { items: [] }, $inc: { __v: 1 } },
        { session }
      );

      if (clearCartResult.modifiedCount !== 1) {
        await session.abortTransaction();
        res.status(409);
        throw new Error(
          "Cart changed while your order was being processed. Please refresh and try again."
        );
      }
    }

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

    if (status === "cancelled") {
      const cancelledOrder = await cancelOrderWithInventory(
        normalizeParam(req.params.id),
        req.user?._id as mongoose.Types.ObjectId | undefined,
        true
      );

      res.status(200).json({ success: true, data: cancelledOrder });
      return;
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, data: order });
  }
);

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await cancelOrderWithInventory(
    normalizeParam(req.params.id),
    req.user?._id as mongoose.Types.ObjectId | undefined,
    req.user?.role === "admin"
  );

  res
    .status(200)
    .json({ success: true, message: "Order cancelled", data: order });
});
