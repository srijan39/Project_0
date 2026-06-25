import mongoose from "mongoose";
import Product from "../models/product.model";
import type { IProductVariant } from "../models/product.model";

export class InventoryError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "InventoryError";
    this.statusCode = statusCode;
  }
}

export const normalizeVariantField = (value?: unknown): string =>
  typeof value === "string" && value.trim() ? value.trim() : "";

export const findVariant = (
  variants: IProductVariant[],
  color: string,
  size: string
): IProductVariant | undefined =>
  variants.find((variant) => variant.color === color && variant.size === size);

export const validateVariantSelection = (
  product: { name: string; variants: IProductVariant[] },
  color: string,
  size: string,
  quantity: number
): IProductVariant => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new InventoryError("Quantity must be a whole number greater than 0");
  }

  if (!color) {
    throw new InventoryError("Color is required for this product");
  }

  if (!size) {
    throw new InventoryError("Size is required for this product");
  }

  if (product.variants.length === 0) {
    throw new InventoryError(`"${product.name}" has no available variants`);
  }

  const colorExists = product.variants.some((variant) => variant.color === color);

  if (!colorExists) {
    throw new InventoryError(
      `Color "${color}" is not available for "${product.name}"`
    );
  }

  const sizeExistsForColor = product.variants.some(
    (variant) => variant.color === color && variant.size === size
  );

  if (!sizeExistsForColor) {
    throw new InventoryError(
      `Size "${size}" is not available for "${product.name}" in color "${color}"`
    );
  }

  const variant = findVariant(product.variants, color, size);

  if (!variant) {
    throw new InventoryError(
      `The variant color "${color}" size "${size}" is not available for "${product.name}"`
    );
  }

  if (variant.stock === 0) {
    throw new InventoryError(`"${product.name}" (${color}/${size}) is out of stock`);
  }

  if (quantity > variant.stock) {
    throw new InventoryError(
      `Only ${variant.stock} unit${variant.stock === 1 ? "" : "s"} of "${product.name}" (${color}/${size}) available`
    );
  }

  return variant;
};

export const decrementVariantStock = (
  productId: mongoose.Types.ObjectId | string,
  color: string,
  size: string,
  quantity: number,
  session: mongoose.ClientSession
) =>
  Product.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          color,
          size,
          stock: { $gte: quantity },
        },
      },
    },
    { $inc: { "variants.$.stock": -quantity } },
    { new: true, session }
  );

export const incrementVariantStock = (
  productId: mongoose.Types.ObjectId | string,
  color: string,
  size: string,
  quantity: number,
  session: mongoose.ClientSession
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
    { $inc: { "variants.$.stock": quantity } },
    { new: true, session }
  );
