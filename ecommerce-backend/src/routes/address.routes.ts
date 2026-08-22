import { Router } from "express";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from "../controllers/address.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect, getAddresses);
router.post("/", protect, addAddress);
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);
router.patch("/:id/default", protect, setDefaultAddress);

export default router;
