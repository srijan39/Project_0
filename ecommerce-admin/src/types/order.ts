import type { Product } from "./product";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export interface OrderUser {
  _id: string;
  name: string;
  email: string;
}

export interface OrderItem {
  product: string | Product;
  quantity: number;
  size?: string;
  color?: string;
  variantSnapshot?: {
    color: string;
    size: string;
  };
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

export interface Order {
  _id: string;
  user: string | OrderUser;
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

export interface AdminOrdersResponse {
  success: boolean;
  page: number;
  limit: number;
  totalPages: number;
  totalOrders: number;
  statuses: OrderStatus[];
  data: Order[];
}

export interface AdminOrderResponse {
  success: boolean;
  data: Order;
}
