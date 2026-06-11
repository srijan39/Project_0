import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

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

export const validateProduct = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .isIn(["men", "women", "kids"])
    .withMessage("Invalid category"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("image")
    .notEmpty()
    .withMessage("Main image is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  ...validateProductArrayFields,

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
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

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

  handleValidationResult,
];
