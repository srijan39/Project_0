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

  body().custom((value) => {
    if (Array.isArray(value)) {
      value.forEach((product) => resolveProductPricing(product));
    }

    return true;
  }),

  handleValidationResult,
];
