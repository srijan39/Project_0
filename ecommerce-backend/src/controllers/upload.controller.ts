import { Request, Response } from "express";
import streamifier from "streamifier";
import type { UploadApiResponse } from "cloudinary";

import cloudinary from "../config/cloudinary";
import asyncHandler from "../utils/asyncHandler";

export const uploadImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }

    const file = req.file;

    const result = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder: "ecommerce/products",
            },
            (error, result) => {
              if (error) return reject(error);
              if (!result) return reject(new Error("Upload failed"));
              resolve(result);
            }
          );

        streamifier.createReadStream(
          file.buffer
        ).pipe(stream);
      }
    );

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  }
);
