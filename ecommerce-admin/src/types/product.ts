export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  features: string[];
}