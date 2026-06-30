import { Request, Response } from "express";
import User from "../models/user.model";
import mongoose from "mongoose";
const getUser = async (userId: string | mongoose.Types.ObjectId) => {
  return User.findById(userId);
};
export const getAddresses = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req.user!._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};
export const addAddress = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req.user!._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      pincode,
      addressType,
      isDefault,
    } = req.body;

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      label: label || "",
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || "",
      landmark: landmark || "",
      city,
      state,
      country: country || "India",
      pincode,
      addressType: addressType || "Home",
      isDefault: false,
    };

    if (!user.addresses) (user.addresses as any) = [];

    // If first address → make default
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    // If explicitly set default → reset others
    if (isDefault) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress as any);

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req.user!._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { id } = req.params;

    const address = user.addresses.id(id as string);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.set(req.body);

    await user.save();

    return res.json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req.user!._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { id } = req.params;

    const address = user.addresses.id(id as string);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;

    address.deleteOne();

    // If deleted was default → assign new default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};
export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req.user!._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { id } = req.params;

    let found = false;

    user.addresses.forEach((addr: any) => {
      if (addr._id.toString() === id) {
        addr.isDefault = true;
        found = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await user.save();

    return res.json({
      success: true,
      message: "Default address updated",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
};
export default {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
