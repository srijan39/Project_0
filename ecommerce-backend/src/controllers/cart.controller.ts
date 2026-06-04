import { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import asyncHandler from "../utils/asyncHandler";

const cartProductPopulate = {
  path: "items.product",
  select: "_id name category price image images description sizes features",
};

const normalizeVariant = (value?: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const normalizeParam = (value: unknown) =>
  Array.isArray(value) ? value[0] : String(value || "");

const isSameCartItem = (
  item: { product: mongoose.Types.ObjectId; size?: string; color?: string },
  productId: string,
  size?: string,
  color?: string
) =>
  item.product.toString() === productId &&
  (item.size || undefined) === size &&
  (item.color || undefined) === color;

export const addToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const itemQuantity = quantity === undefined ? 1 : Number(quantity);
    const size = normalizeVariant(req.body.size);
    const color = normalizeVariant(req.body.color);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product id is required",
      });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    if (!Number.isInteger(itemQuantity) || itemQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number greater than 0",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({
      user: req.user?._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user?._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => isSameCartItem(item, productId, size, color)
    );

    if (existingItem) {
      existingItem.quantity += itemQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity: itemQuantity,
        size,
        color,
      });
    }

    await cart.save();
    await cart.populate(cartProductPopulate);

    res.status(200).json({
      success: true,
      data: cart,
    });
  }
);
export const getCart = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await Cart.findOne({
      user: req.user?._id,
    }).populate(cartProductPopulate);

    res.status(200).json({
      success: true,
      data: cart,
    });
  }
);
export const removeFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = normalizeParam(req.params.productId);
    const size = normalizeVariant(req.query.size);
    const color = normalizeVariant(req.query.color);

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const cart = await Cart.findOne({
      user: req.user?._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => !isSameCartItem(item, productId, size, color)
    );

    await cart.save();
    await cart.populate(cartProductPopulate);

    res.status(200).json({
      success: true,
      data: cart,
    });
  }
);

export const updateCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = normalizeParam(req.params.productId);
    const quantity = Number(req.body.quantity);
    const size = normalizeVariant(req.body.size);
    const color = normalizeVariant(req.body.color);

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number greater than or equal to 0",
      });
    }

    const cart = await Cart.findOne({
      user: req.user?._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const existingItem = cart.items.find((item) =>
      isSameCartItem(item, productId, size, color)
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(
        (item) => !isSameCartItem(item, productId, size, color)
      );
    } else {
      existingItem.quantity = quantity;
    }

    await cart.save();
    await cart.populate(cartProductPopulate);

    res.status(200).json({
      success: true,
      data: cart,
    });
  }
);
