import { getProductById } from "../api/products";
import type { CheckoutSessionItem, ValidatedCheckoutItem } from "../types/checkout";
import { normalizeProductPricing } from "./pricing";

const normalizeVariantValue = (value?: string) => value?.trim() || "";

export const validateCheckoutItems = async (
  items: CheckoutSessionItem[]
): Promise<ValidatedCheckoutItem[]> => {
  if (items.length === 0) {
    throw new Error("Your checkout is empty.");
  }

  const validatedItems = await Promise.all(
    items.map(async (item) => {
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Checkout quantity must be at least 1.");
      }

      const product = await getProductById(item.productId);
      const color = normalizeVariantValue(item.color);
      const size = normalizeVariantValue(item.size);

      if (!product.variants || product.variants.length === 0) {
        throw new Error(`"${product.name}" is not available for checkout.`);
      }

      if (!color) {
        throw new Error(`Please select a color for "${product.name}".`);
      }

      if (!size) {
        throw new Error(`Please select a size for "${product.name}".`);
      }

      const colorExists = product.variants.some(
        (variant) => variant.color === color
      );

      if (!colorExists) {
        throw new Error(`"${product.name}" is no longer available in ${color}.`);
      }

      const variant = product.variants.find(
        (productVariant) =>
          productVariant.color === color && productVariant.size === size
      );

      if (!variant) {
        throw new Error(
          `"${product.name}" is no longer available in ${color} / ${size}.`
        );
      }

      if (variant.stock === 0) {
        throw new Error(`"${product.name}" (${color} / ${size}) is out of stock.`);
      }

      if (quantity > variant.stock) {
        throw new Error(
          `Only ${variant.stock} unit${variant.stock === 1 ? "" : "s"} of "${product.name}" (${color} / ${size}) available.`
        );
      }

      return {
        product,
        pricing: normalizeProductPricing(product),
        quantity,
        size,
        color,
      };
    })
  );

  return validatedItems;
};
