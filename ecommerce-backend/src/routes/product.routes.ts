import { Router } from "express";
import {
  getProducts,
  createProduct,
  createProductsBulk,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { validateProduct } from "../middleware/productValidation";

import { protect, admin } from "../middleware/auth.middleware";
const router = Router();

router.get("/", getProducts);
router.post("/bulk", protect, admin, createProductsBulk);
router.post("/", protect, admin, validateProduct, createProduct);
router.get("/:id", getProductById);

router.put("/:id", protect, admin, updateProduct);

router.delete("/:id", protect, admin, deleteProduct);
export default router;
