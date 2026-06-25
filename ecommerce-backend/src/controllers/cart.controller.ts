import { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import asyncHandler from "../utils/asyncHandler";
import {
  InventoryError,
  normalizeVariantField,
  validateVariantSelection,
} from "../utils/inventory";

const cartProductPopulate = {
  path: "items.product",
  select:
    "_id name category price actualPrice sellingPrice discountPercentage image images description features variants",
};

const normalizeParam = (value: unknown) =>
  Array.isArray(value) ? value[0] : String(value || "");

const isSameCartItem = (
  item: { product: mongoose.Types.ObjectId; size: string; color: string },
  productId: string,
  size: string,
  color: string
) =>
  item.product.toString() === productId &&
  item.size === size &&
  item.color === color;

export const addToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const itemQuantity = quantity === undefined ? 1 : Number(quantity);
    const color = normalizeVariantField(req.body.color);
    const size = normalizeVariantField(req.body.size);

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

    const currentCartQty = existingItem?.quantity ?? 0;
    const totalRequested = currentCartQty + itemQuantity;

    try {
      validateVariantSelection(product, color, size, totalRequested);
    } catch (error) {
      if (error instanceof InventoryError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      throw error;
    }

    if (existingItem) {
      existingItem.quantity += itemQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity: itemQuantity,
        color,
        size,
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
    const color = normalizeVariantField(req.query.color);
    const size = normalizeVariantField(req.query.size);

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
    const color = normalizeVariantField(req.body.color);
    const size = normalizeVariantField(req.body.size);

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

    if (quantity > 0) {
      const product = await Product.findById(productId).select("name variants");

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      try {
        validateVariantSelection(product, color, size, quantity);
      } catch (error) {
        if (error instanceof InventoryError) {
          return res.status(error.statusCode).json({
            success: false,
            message: error.message,
          });
        }

        throw error;
      }
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
