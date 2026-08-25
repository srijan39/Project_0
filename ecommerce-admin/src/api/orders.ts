import api from "./axios";
import type {
  AdminOrderResponse,
  AdminOrdersResponse,
  OrderStatus,
} from "../types/order";

export interface AdminOrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
}

export const getAdminOrders = async (params: AdminOrderListParams = {}) => {
  const response = await api.get<AdminOrdersResponse>("/orders/admin/all", {
    params,
  });

  return response.data;
};

export const getAdminOrderById = async (id: string) => {
  const response = await api.get<AdminOrderResponse>(`/orders/admin/${id}`);

  return response.data;
};

export const updateAdminOrderStatus = async (
  id: string,
  status: OrderStatus
) => {
  const response = await api.put<AdminOrderResponse>(
    `/orders/admin/${id}/status`,
    { status }
  );

  return response.data;
};
