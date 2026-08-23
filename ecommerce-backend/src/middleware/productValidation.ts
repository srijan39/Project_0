import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { resolveProductPricing } from "../utils/pricing";
import {
  isCollectionTagSlug,
  slugifyCollectionTag,
} from "../constants/collections";

const handleValidationResult = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return;
  }

  next();
};

const validateStringArray = (field: string) => [
  body(field)
    .optional()
    .isArray()
    .withMessage(`${field} must be an array`),
  body(`${field}.*`)
    .optional()
    .isString()
    .withMessage(`${field} values must be strings`)
    .trim(),
];

const validateProductArrayFields = [
  ...validateStringArray("images"),
  ...validateStringArray("features"),
];

const validateCollectionTagsValue = (collectionTags: unknown) => {
  if (!Array.isArray(collectionTags) || collectionTags.length === 0) return true;

  const seen = new Set<string>();

  for (const tag of collectionTags) {
    if (typeof tag !== "string") {
      throw new Error("collectionTags values must be strings");
    }

    const slug = slugifyCollectionTag(tag);

    if (!isCollectionTagSlug(slug)) {
      throw new Error(`Unsupported collection tag: ${tag}`);
    }

    if (seen.has(slug)) {
      throw new Error(`Duplicate collection tag: ${tag}`);
    }

    seen.add(slug);
  }

  return true;
};

const validateCollectionTagsField = [
  body("collectionTags")
    .optional()
    .isArray()
    .withMessage("collectionTags must be an array")
    .custom(validateCollectionTagsValue),
];

const validateBulkCollectionTagsField = [
  body("*.collectionTags")
    .optional()
    .isArray()
    .withMessage("collectionTags must be an array")
    .custom(validateCollectionTagsValue),
];

const validateVariantsField = [
  body("variants")
    .optional()
    .isArray()
    .withMessage("variants must be an array"),

  body("variants.*.color")
    .if(body("variants").exists())
    .notEmpty()
    .withMessage("variant color is required")
    .isString()
    .withMessage("variant color must be a string")
    .trim(),

  body("variants.*.size")
    .if(body("variants").exists())
    .notEmpty()
    .withMessage("variant size is required")
    .isString()
    .withMessage("variant size must be a string")
    .trim(),

  body("variants.*.stock")
    .if(body("variants").exists())
    .exists({ checkNull: true })
    .withMessage("variant stock is required")
    .isInt({ min: 0 })
    .withMessage("variant stock must be a non-negative integer"),

  body("variants").custom((variants: unknown) => {
    if (!Array.isArray(variants) || variants.length === 0) return true;

    const seen = new Set<string>();

    for (const v of variants) {
      if (typeof v !== "object" || v === null) continue;

      const item = v as Record<string, unknown>;
      const color = String(item.color ?? "").trim();
      const size = String(item.size ?? "").trim();
      const key = `${color}|${size}`;

      if (seen.has(key)) {
        throw new Error(
          `Duplicate variant: color "${color}" + size "${size}" appears more than once`
        );
      }

      seen.add(key);
    }

    return true;
  }),
];

const validateDuplicateVariants = (variants: unknown) => {
  if (!Array.isArray(variants) || variants.length === 0) return true;

  const seen = new Set<string>();

  for (const v of variants) {
    if (typeof v !== "object" || v === null) continue;

    const item = v as Record<string, unknown>;
    const color = String(item.color ?? "").trim();
    const size = String(item.size ?? "").trim();
    const key = `${color}|${size}`;

    if (seen.has(key)) {
      throw new Error(
        `Duplicate variant: color "${color}" + size "${size}" appears more than once`
      );
    }

    seen.add(key);
  }

  return true;
};

const validateBulkVariantsField = [
  body("*.variants")
    .optional()
    .isArray()
    .withMessage("variants must be an array"),

  body("*.variants.*.color")
    .if(body("*.variants").exists())
    .notEmpty()
    .withMessage("variant color is required")
    .isString()
    .withMessage("variant color must be a string")
    .trim(),

  body("*.variants.*.size")
    .if(body("*.variants").exists())
    .notEmpty()
    .withMessage("variant size is required")
    .isString()
    .withMessage("variant size must be a string")
    .trim(),

  body("*.variants.*.stock")
    .if(body("*.variants").exists())
    .exists({ checkNull: true })
    .withMessage("variant stock is required")
    .isInt({ min: 0 })
    .withMessage("variant stock must be a non-negative integer"),

  body("*.variants").custom(validateDuplicateVariants),
];

const validateCreatePricing = body().custom((value) => {
  resolveProductPricing(value);
  return true;
});

const validateUpdatePricing = body().custom((value) => {
  const hasPricingUpdate =
    value &&
    (value.price !== undefined ||
      value.actualPrice !== undefined ||
      value.sellingPrice !== undefined);

  if (
    hasPricingUpdate &&
    value.actualPrice !== undefined &&
    value.sellingPrice !== undefined
  ) {
    resolveProductPricing(value);
  }

  if (
    hasPricingUpdate &&
    value.price !== undefined &&
    value.actualPrice === undefined &&
    value.sellingPrice === undefined
  ) {
    resolveProductPricing(value);
  }

  return true;
});

export const validateProduct = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .isIn(["men", "women", "kids"])
    .withMessage("Invalid category"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("actualPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Original price must be a positive number"),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),

  body("image")
    .notEmpty()
    .withMessage("Main image is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  ...validateProductArrayFields,
  ...validateCollectionTagsField,
  ...validateVariantsField,

  validateCreatePricing,

  handleValidationResult,
];

export const validateProductUpdate = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("category")
    .optional()
    .isIn(["men", "women", "kids"])
    .withMessage("Invalid category"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("actualPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Original price must be a positive number"),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),

  body("image")
    .optional()
    .notEmpty()
    .withMessage("Main image cannot be empty"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),

  ...validateProductArrayFields,
  ...validateCollectionTagsField,
  ...validateVariantsField,

  validateUpdatePricing,

  handleValidationResult,
];

export const validateProductsBulk = [
  body()
    .isArray({ min: 1 })
    .withMessage("Request body must be a non-empty array of products"),

  body("*.name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("*.category")
    .isIn(["men", "women", "kids"])
    .withMessage("Invalid category"),

  body("*.price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("*.actualPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Original price must be a positive number"),

  body("*.sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),

  body("*.image")
    .notEmpty()
    .withMessage("Main image is required"),

  body("*.description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  ...["images", "features"].flatMap((field) => [
    body(`*.${field}`)
      .optional()
      .isArray()
      .withMessage(`${field} must be an array`),
    body(`*.${field}.*`)
      .optional()
      .isString()
      .withMessage(`${field} values must be strings`)
      .trim(),
  ]),

  ...validateBulkVariantsField,
  ...validateBulkCollectionTagsField,

  body().custom((value) => {
    if (Array.isArray(value)) {
      value.forEach((product: Record<string, unknown>) => resolveProductPricing(product));
    }

    return true;
  }),

  handleValidationResult,
];
