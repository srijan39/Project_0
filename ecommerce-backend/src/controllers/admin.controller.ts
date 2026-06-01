import { Request, Response } from "express";
import User from "../models/user.model";
import Product from "../models/product.model";
import Cart from "../models/cart.model";
import asyncHandler from "../utils/asyncHandler";

export const getDashboardStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCarts = await Cart.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalCarts,
        totalAdmins,
      },
    });
  }
);

export const getUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  }
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const updateUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role",
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  }
);