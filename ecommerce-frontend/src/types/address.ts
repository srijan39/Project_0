export interface Address {
  _id: string;
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  addressType: "Home" | "Office" | "Other";
  isDefault: boolean;
}

export type AddressInput = Omit<Address, "_id" | "isDefault"> & {
  isDefault?: boolean;
};

export interface AddressResponse {
  success: boolean;
  message?: string;
  addresses: Address[];
}
