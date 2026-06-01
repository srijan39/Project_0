import { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import asyncHandler from "../utils/asyncHandler";

const cartProductPopulate = {
  path: "items.product",
  select: "_id name price image category",
};

export const addToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const itemQuantity = quantity === undefined ? 1 : Number(quantity);

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
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += itemQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity: itemQuantity,
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
    const { productId } = req.params;

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
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate(cartProductPopulate);

    res.status(200).json({
      success: true,
      data: cart,
    });
  }
);
