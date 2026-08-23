import { Request, Response } from "express";
import Product from "../models/product.model";
import type { IProductVariant } from "../models/product.model";
import asyncHandler from "../utils/asyncHandler";
import { resolveProductPricing } from "../utils/pricing";
import {
  COLLECTION_TAGS,
  normalizeCollectionTags,
  slugifyCollectionTag,
} from "../constants/collections";

type ProductPayload = Record<string, unknown>;

const arrayFields = ["images", "features"] as const;
const sortableFields = new Set([
  "price_asc",
  "price_desc",
  "newest",
  "oldest",
  "discount_desc",
]);
const supportedDiscountFilters = new Set(["on_sale", "10", "20", "30", "50"]);

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
      color: String(item.color ?? "").trim(),
      size: String(item.size ?? "").trim(),
      stock: Math.max(0, Math.round(Number(item.stock) || 0)),
    }));
};

const deriveColorsFromVariants = (variants: IProductVariant[]): string[] =>
  [...new Set(variants.map((v) => v.color))];

const deriveSizesFromVariants = (variants: IProductVariant[]): string[] =>
  [...new Set(variants.map((v) => v.size))];

const toQueryString = (value: unknown) =>
  Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseStringList = (value: unknown) =>
  toQueryString(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseCollectionList = (value: unknown) =>
  parseStringList(value)
    .map(slugifyCollectionTag)
    .filter(Boolean);

const toCaseInsensitiveExactMatch = (value: string) =>
  new RegExp(`^${escapeRegExp(value)}$`, "i");

const parsePositiveInt = (value: unknown, fallback: number, max: number) => {
  const parsed = parseInt(toQueryString(value), 10);

  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
};

const parseBoolean = (value: unknown) =>
  ["true", "1", "yes"].includes(toQueryString(value).trim().toLowerCase());

const parseDiscountFilter = (value: unknown) => {
  const discount = toQueryString(value).trim().toLowerCase();

  return supportedDiscountFilters.has(discount) ? discount : "";
};

const getAvailableFilterOptions = async () => {
  const effectivePriceExpression = { $ifNull: ["$sellingPrice", "$price"] };

  const [options] = await Product.aggregate([
    {
      $facet: {
        categories: [
          { $group: { _id: "$category" } },
          { $match: { _id: { $ne: null } } },
          { $sort: { _id: 1 } },
        ],
        colors: [
          { $unwind: "$variants" },
          { $group: { _id: "$variants.color" } },
          { $match: { _id: { $nin: [null, ""] } } },
          { $sort: { _id: 1 } },
        ],
        sizes: [
          { $unwind: "$variants" },
          { $group: { _id: "$variants.size" } },
          { $match: { _id: { $nin: [null, ""] } } },
          { $sort: { _id: 1 } },
        ],
        priceRange: [
          {
            $group: {
              _id: null,
              min: { $min: effectivePriceExpression },
              max: { $max: effectivePriceExpression },
            },
          },
        ],
      },
    },
  ]);

  return {
    categories:
      options?.categories?.map((item: { _id: string }) => item._id) ?? [],
    colors: options?.colors?.map((item: { _id: string }) => item._id) ?? [],
    sizes: options?.sizes?.map((item: { _id: string }) => item._id) ?? [],
    collections: COLLECTION_TAGS,
    priceRange: {
      min: options?.priceRange?.[0]?.min ?? null,
      max: options?.priceRange?.[0]?.max ?? null,
    },
  };
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

  if (Array.isArray(payload.collectionTags) || includeDefaults) {
    normalizedPayload.collectionTags = normalizeCollectionTags(
      payload.collectionTags
    );
  }

  delete normalizedPayload.sizes;
  delete normalizedPayload.colors;

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
  const variants = Array.isArray(productObject.variants)
    ? (productObject.variants as IProductVariant[])
    : [];

  return {
    ...productObject,
    actualPrice: pricing.actualPrice,
    sellingPrice: pricing.sellingPrice,
    discountPercentage: pricing.discountPercentage,
    price: pricing.price,
    images: Array.isArray(productObject.images) ? productObject.images : [],
    features: Array.isArray(productObject.features) ? productObject.features : [],
    collectionTags: Array.isArray(productObject.collectionTags)
      ? normalizeCollectionTags(productObject.collectionTags)
      : [],
    variants,
    colors: deriveColorsFromVariants(variants),
    sizes: deriveSizesFromVariants(variants),
  };
};

export const getProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parsePositiveInt(req.query.page, 1, 10000);
    const limit = parsePositiveInt(req.query.limit, 10, 100);
    const search = toQueryString(req.query.search).trim();
    const category = toQueryString(req.query.category).trim().toLowerCase();
    const collectionQuery = req.query.collection ?? req.query.collectionTag;
    const collections = parseCollectionList(collectionQuery);
    const colors = parseStringList(req.query.color);
    const sizes = parseStringList(req.query.size);
    const minPrice = parseFloat(toQueryString(req.query.minPrice));
    const maxPrice = parseFloat(toQueryString(req.query.maxPrice));
    const inStock = parseBoolean(req.query.inStock);
    const discount = parseDiscountFilter(req.query.discount);
    const requestedSort = toQueryString(req.query.sort).trim().toLowerCase();
    const sort = sortableFields.has(requestedSort) ? requestedSort : "";

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (collections.length > 0) {
      filter.collectionTags = { $in: collections };
    } else if (toQueryString(collectionQuery).trim()) {
      filter.collectionTags = { $in: collections };
    }

    const variantFilter: Record<string, unknown> = {};

    if (colors.length > 0) {
      variantFilter.color = {
        $in: colors.map(toCaseInsensitiveExactMatch),
      };
    }

    if (sizes.length > 0) {
      variantFilter.size = {
        $in: sizes.map(toCaseInsensitiveExactMatch),
      };
    }

    if (inStock) {
      variantFilter.stock = { $gt: 0 };
    }

    if (Object.keys(variantFilter).length > 0) {
      filter.variants = { $elemMatch: variantFilter };
    }

    if (discount) {
      filter.discountPercentage =
        discount === "on_sale"
          ? { $gt: 0 }
          : { $gte: Number(discount) };
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
    } else if (sort === "discount_desc") {
      sortOption.discountPercentage = -1;
    }

    const productPipeline = [
      { $match: filter },
      { $addFields: { effectiveSellingPrice: effectivePriceExpression } },
      ...(Object.keys(sortOption).length > 0 ? [{ $sort: sortOption }] : []),
      { $skip: skip },
      { $limit: limit },
      { $project: { effectiveSellingPrice: 0 } },
    ];

    const [products, [{ total = 0 } = {}], availableFilters] =
      await Promise.all([
        Product.aggregate(productPipeline),
        Product.aggregate([{ $match: filter }, { $count: "total" }]),
        getAvailableFilterOptions(),
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
        collection: collections,
        color: colors,
        size: sizes,
        minPrice: isNaN(minPrice) ? null : minPrice,
        maxPrice: isNaN(maxPrice) ? null : maxPrice,
        inStock,
        discount,
        sort,
      },
      availableFilters,
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
