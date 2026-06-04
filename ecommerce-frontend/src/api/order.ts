import { apiRequest } from "./client";
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

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
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

export const getOrders = async () => {
  return apiRequest<OrdersResponse>("/orders");
};

export const getOrderById = async (id: string) => {
  return apiRequest<OrderResponse>(`/orders/${id}`);
};

export const createOrder = async () => {
  return apiRequest<OrderResponse>("/orders", {
    method: "POST",
  });
};
