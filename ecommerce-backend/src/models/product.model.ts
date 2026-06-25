import mongoose, { Schema, Document } from "mongoose";
import { resolveProductPricing } from "../utils/pricing";

export interface IProductVariant {
  color: string;
  size: string;
  stock: number;
}

const variantSchema = new Schema<IProductVariant>(
  {
    color: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
  },
  { _id: false },
);

export interface IProduct extends Document {
  name: string;
  category: "men" | "women" | "kids";
  price: number;
  actualPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  variants: IProductVariant[];
  readonly sizes: string[];
  readonly colors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["men", "women", "kids"],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    actualPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      required: true,
    },

    features: {
      type: [String],
      default: [],
    },

    variants: {
      type: [variantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("sizes").get(function (this: IProduct): string[] {
  return [...new Set(this.variants.map((v) => v.size))];
});

productSchema.virtual("colors").get(function (this: IProduct): string[] {
  return [...new Set(this.variants.map((v) => v.color))];
});

productSchema.pre("validate", function calculateProductPricing() {
  const pricing = resolveProductPricing(this);

  this.actualPrice = pricing.actualPrice;
  this.sellingPrice = pricing.sellingPrice;
  this.discountPercentage = pricing.discountPercentage;
  this.price = pricing.price;
});

export default mongoose.model<IProduct>("Product", productSchema);
