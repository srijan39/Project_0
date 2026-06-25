export interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  _id: string;
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
  variants: ProductVariant[];
}

export type ProductCategory = "men" | "women" | "kids";

export interface ProductInput {
  name: string;
  category: ProductCategory;
  price: number;
  actualPrice: number;
  sellingPrice: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  variants: ProductVariant[];
}
