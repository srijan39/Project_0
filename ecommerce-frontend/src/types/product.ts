export type ProductCategory = "men" | "women" | "kids";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  actualPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  features: string[];
}

export interface BackendProduct {
  _id: string;
  name: string;
  category: ProductCategory;
  price: number;
  actualPrice?: number;
  sellingPrice?: number;
  discountPercentage?: number;
  image: string;
  images?: string[];
  description: string;
  sizes?: string[];
  colors?: string[];
  features?: string[];
}
