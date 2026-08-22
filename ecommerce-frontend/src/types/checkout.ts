import type { Product } from "./product";
import type { Address } from "./address";
import type { ProductPricing } from "../utils/pricing";

export type CheckoutSource = "cart" | "buyNow";

export interface CheckoutSessionItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CheckoutSession {
  source: CheckoutSource;
  items: CheckoutSessionItem[];
  addressId: string;
  createdAt: number;
}

export interface ValidatedCheckoutItem {
  product: Product;
  pricing: ProductPricing;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CheckoutAddressSelection {
  address: Address;
}
