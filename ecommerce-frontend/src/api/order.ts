import { apiRequest } from "./client";
import type { CheckoutSessionItem } from "../types/checkout";
import type { Product } from "../types/product";

export interface OrderItem {
  product: string | Product;
  quantity: number;
  size?: string;
  color?: string;
  name: string;
  image: string;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  success: boolean;
  count: number;
  data: Order[];
}

interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface CreateOrderPayload {
  addressId: string;
  items?: CheckoutSessionItem[];
}

export const getOrders = async () => {
  return apiRequest<OrdersResponse>("/orders/my-orders");
};

export const getOrderById = async (id: string) => {
  return apiRequest<OrderResponse>(`/orders/${id}`);
};

export const createOrder = async (payload: CreateOrderPayload) => {
  return apiRequest<OrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const cancelOrder = async (id: string) => {
  return apiRequest<OrderResponse>(`/orders/${id}/cancel`, {
    method: "PUT",
  });
};
