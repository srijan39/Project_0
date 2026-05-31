import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

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

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    next();
  },
];