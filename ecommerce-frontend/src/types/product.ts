export type ProductCategory = "men" | "women" | "kids";

export interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

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
  collectionTags: string[];
  variants: ProductVariant[];
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
  collectionTags?: string[];
  variants?: ProductVariant[];
}
