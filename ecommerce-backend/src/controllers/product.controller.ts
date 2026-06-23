import { Request, Response } from "express";
import Product from "../models/product.model";
import type { IProductVariant } from "../models/product.model";
import asyncHandler from "../utils/asyncHandler";
import { resolveProductPricing } from "../utils/pricing";

type ProductPayload = Record<string, unknown>;

const arrayFields = ["images", "sizes", "colors", "features"] as const;

const normalizeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};


const normalizeVariants = (value: unknown): IProductVariant[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> =>
      item !== null && typeof item === "object"
    )
    .map((item) => ({
      size: String(item.size ?? "").trim(),
      color: String(item.color ?? "").trim(),
      stock: Math.max(0, Math.round(Number(item.stock) || 0)),
    }));
};

const normalizeProductPayload = (
  payload: ProductPayload,
  includeDefaults = false,
  fallback?: ProductPayload
) => {
  const normalizedPayload = { ...payload };

  arrayFields.forEach((field) => {
    if (Array.isArray(payload[field]) || includeDefaults) {
      normalizedPayload[field] = normalizeStringArray(payload[field]);
    }
  });


  if (Array.isArray(payload.variants) || includeDefaults) {
    normalizedPayload.variants = normalizeVariants(payload.variants);
  }

  if (
    fallback ||
    payload.actualPrice !== undefined ||
    payload.sellingPrice !== undefined ||
    payload.price !== undefined
  ) {
    const pricing = resolveProductPricing(payload, fallback);

    normalizedPayload.actualPrice = pricing.actualPrice;
    normalizedPayload.sellingPrice = pricing.sellingPrice;
    normalizedPayload.discountPercentage = pricing.discountPercentage;
    normalizedPayload.price = pricing.price;
  }

  return normalizedPayload;
};

const serializeProduct = (product: unknown) => {
  const productObject =
    product &&
      typeof product === "object" &&
      "toObject" in product &&
      typeof (product as { toObject: () => Record<string, unknown> }).toObject ===
      "function"
      ? (product as { toObject: () => Record<string, unknown> }).toObject()
      : ({ ...(product as Record<string, unknown>) } as Record<string, unknown>);

  const pricing = resolveProductPricing(productObject);

  return {
    ...productObject,
    actualPrice: pricing.actualPrice,
    sellingPrice: pricing.sellingPrice,
    discountPercentage: pricing.discountPercentage,
    price: pricing.price,
    images: Array.isArray(productObject.images) ? productObject.images : [],
    sizes: Array.isArray(productObject.sizes) ? productObject.sizes : [],
    colors: Array.isArray(productObject.colors) ? productObject.colors : [],
    features: Array.isArray(productObject.features) ? productObject.features : [],
    variants: Array.isArray(productObject.variants) ? productObject.variants : [],
  };
};

export const getProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const sort = (req.query.sort as string) || "";

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    const effectivePriceExpression = { $ifNull: ["$sellingPrice", "$price"] };
    const priceExpressions = [];

    if (!isNaN(minPrice)) {
      priceExpressions.push({ $gte: [effectivePriceExpression, minPrice] });
    }

    if (!isNaN(maxPrice)) {
      priceExpressions.push({ $lte: [effectivePriceExpression, maxPrice] });
    }

    if (priceExpressions.length === 1) {
      filter.$expr = priceExpressions[0];
    } else if (priceExpressions.length > 1) {
      filter.$expr = { $and: priceExpressions };
    }

    const sortOption: Record<string, 1 | -1> = {};

    if (sort === "price_asc") {
      sortOption.effectiveSellingPrice = 1;
    } else if (sort === "price_desc") {
      sortOption.effectiveSellingPrice = -1;
    } else if (sort === "newest") {
      sortOption.createdAt = -1;
    } else if (sort === "oldest") {
      sortOption.createdAt = 1;
    }

    const products = await Product.aggregate([
      { $match: filter },
      { $addFields: { effectiveSellingPrice: effectivePriceExpression } },
      ...(Object.keys(sortOption).length > 0 ? [{ $sort: sortOption }] : []),
      { $skip: skip },
      { $limit: limit },
      { $project: { effectiveSellingPrice: 0 } },
    ]);

    const [{ total = 0 } = {}] = await Product.aggregate([
      { $match: filter },
      { $count: "total" },
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      filters: {
        search,
        category,
        minPrice: isNaN(minPrice) ? null : minPrice,
        maxPrice: isNaN(maxPrice) ? null : maxPrice,
        sort,
      },
      data: products.map(serializeProduct),
    });
  }
);

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.create(
      normalizeProductPayload(req.body, true)
    );

    res.status(201).json({
      success: true,
      data: serializeProduct(product),
    });
  }
);

export const createProductsBulk = asyncHandler(
  async (req: Request, res: Response) => {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array of products",
      });
    }

    if (req.body.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products array cannot be empty",
      });
    }

    const products = await Product.insertMany(
      req.body.map((product: ProductPayload) =>
        normalizeProductPayload(product, true)
      )
    );

    res.status(201).json({
      success: true,
      count: products.length,
      data: products.map(serializeProduct),
    });
  }
);

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: serializeProduct(product),
    });
  }
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      normalizeProductPayload(req.body, false, serializeProduct(product)),
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: serializeProduct(updatedProduct),
    });
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  }
);
