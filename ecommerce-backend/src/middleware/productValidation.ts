import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { resolveProductPricing } from "../utils/pricing";

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
  ...validateStringArray("sizes"),
  ...validateStringArray("colors"),
  ...validateStringArray("features"),
];


const validateVariantsField = [
  body("variants")
    .optional()
    .isArray()
    .withMessage("variants must be an array"),

  body("variants.*.size")
    .optional()
    .isString()
    .withMessage("variant size must be a string")
    .trim(),

  body("variants.*.color")
    .optional()
    .isString()
    .withMessage("variant color must be a string")
    .trim(),

  body("variants.*.stock")
    .exists({ checkNull: true })
    .withMessage("variant stock is required")
    .isInt({ min: 0 })
    .withMessage("variant stock must be a non-negative integer"),

  // Cross-field: no two variants in the same request may share the same size+color
  body("variants").custom((variants: unknown) => {
    if (!Array.isArray(variants) || variants.length === 0) return true;

    const seen = new Set<string>();

    for (const v of variants) {
      if (typeof v !== "object" || v === null) continue;

      const item = v as Record<string, unknown>;
      const key = `${String(item.size ?? "")}|${String(item.color ?? "")}`;

      if (seen.has(key)) {
        throw new Error(
          `Duplicate variant: size "${item.size ?? ""}" + color "${item.color ?? ""}" appears more than once`
        );
      }

      seen.add(key);
    }

    return true;
  }),
];

const validateBulkVariantsField = [
  body("*.variants")
    .optional()
    .isArray()
    .withMessage("variants must be an array"),

  body("*.variants.*.size")
    .optional()
    .isString()
    .withMessage("variant size must be a string")
    .trim(),

  body("*.variants.*.color")
    .optional()
    .isString()
    .withMessage("variant color must be a string")
    .trim(),

  body("*.variants.*.stock")
    .if(body("*.variants").exists())
    .isInt({ min: 0 })
    .withMessage("variant stock must be a non-negative integer"),
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

  ...["images", "sizes", "colors", "features"].flatMap((field) => [
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

  body().custom((value) => {
    if (Array.isArray(value)) {
      value.forEach((product) => resolveProductPricing(product));
    }

    return true;
  }),

  handleValidationResult,
];
