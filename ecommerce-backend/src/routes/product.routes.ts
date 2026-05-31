import { Router } from "express";
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { validateProduct } from "../middleware/productValidation";
import { protect } from "../middleware/auth.middleware";
import { protect, adminOnly } from "../middleware/auth.middleware";
const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, adminOnly, validateProduct, createProduct);

router.put("/:id", protect, adminOnly, updateProduct);

router.delete("/:id", protect, adminOnly, deleteProduct);
export default router;