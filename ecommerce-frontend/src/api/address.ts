import { apiRequest } from "./client";
import type { Address, AddressInput, AddressResponse } from "../types/address";

export const getAddresses = async (): Promise<Address[]> => {
  const response = await apiRequest<AddressResponse>("/addresses");
  return response.addresses || [];
};

export const addAddress = async (data: AddressInput): Promise<Address[]> => {
  const response = await apiRequest<AddressResponse>("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.addresses || [];
};

export const updateAddress = async (
  id: string,
  data: Partial<AddressInput>
): Promise<Address[]> => {
  const response = await apiRequest<AddressResponse>(`/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.addresses || [];
};

export const deleteAddress = async (id: string): Promise<Address[]> => {
  const response = await apiRequest<AddressResponse>(`/addresses/${id}`, {
    method: "DELETE",
  });
  return response.addresses || [];
};

export const setDefaultAddress = async (id: string): Promise<Address[]> => {
  const response = await apiRequest<AddressResponse>(`/addresses/${id}/default`, {
    method: "PATCH",
  });
  return response.addresses || [];
};
