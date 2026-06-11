export interface Product {
  _id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  features: string[];
}

export type ProductCategory = "men" | "women" | "kids";

export interface ProductInput {
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  features: string[];
}
