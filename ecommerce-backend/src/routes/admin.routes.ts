import { Router } from "express";
import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/admin.controller";

import { protect, admin } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, admin);

router.get("/dashboard", getDashboardStats);

router.get("/users", getUsers);

router.get("/users/:id", getUserById);

router.put("/users/:id/role", updateUserRole);

router.delete("/users/:id", deleteUser);

export default router;