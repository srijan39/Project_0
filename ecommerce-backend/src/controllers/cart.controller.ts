import { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import type { IProductVariant } from "../models/product.model";
import asyncHandler from "../utils/asyncHandler";

const cartProductPopulate = {
  path: "items.product",
  select:
    "_id name category price actualPrice sellingPrice discountPercentage image images description sizes colors features variants",
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


const findVariant = (
  variants: IProductVariant[],
  size: string | undefined,
  color: string | undefined
): IProductVariant | undefined =>
  variants.find(
    (v) =>
      v.size === (size ?? "") &&
      v.color === (color ?? "")
  );

const checkVariantStock = (
  product: { name: string; variants: IProductVariant[] },
  size: string | undefined,
  color: string | undefined,
  requestedTotal: number
): { status: number; message: string } | null => {
  if (!product.variants || product.variants.length === 0) {
    // No variant inventory configured — allow purchase (backward compatible)
    return null;
  }

  const variant = findVariant(product.variants, size, color);

  if (!variant) {
    const sizeLabel = size ? ` size "${size}"` : "";
    const colorLabel = color ? ` color "${color}"` : "";
    return {
      status: 400,
      message: `The selected variant${sizeLabel}${colorLabel} is not available for "${product.name}"`,
    };
  }

  if (variant.stock === 0) {
    const sizeLabel = size ? ` (${size}` : "";
    const colorLabel = color ? `/${color})` : size ? ")" : "";
    return {
      status: 400,
      message: `"${product.name}"${sizeLabel}${colorLabel} is out of stock`,
    };
  }

  if (requestedTotal > variant.stock) {
    return {
      status: 400,
      message: `Only ${variant.stock} unit${variant.stock === 1 ? "" : "s"} of "${product.name}" available for the selected variant`,
    };
  }

  return null;
};

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


    const currentCartQty = existingItem?.quantity ?? 0;
    const totalRequested = currentCartQty + itemQuantity;

    const stockError = checkVariantStock(product, size, color, totalRequested);

    if (stockError) {
      return res.status(stockError.status).json({
        success: false,
        message: stockError.message,
      });
    }

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

    // Stock validation — only when increasing quantity (quantity > 0)
    if (quantity > 0) {
      const product = await Product.findById(productId).select("name variants");

      if (product) {
        const stockError = checkVariantStock(product, size, color, quantity);

        if (stockError) {
          return res.status(stockError.status).json({
            success: false,
            message: stockError.message,
          });
        }
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
