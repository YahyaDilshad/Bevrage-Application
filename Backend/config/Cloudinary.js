import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {string | object} filePath - Local path or multer file object
 * @returns {Promise<{url: string, raw: object}>}
 */
export const uploadToCloudinary = async (filePath) => {
  try {
    let uploadOptions = { folder: "your_folder_name" }; // optional: Cloudinary folder

    if (typeof filePath === "string") {
      // Local file path
      const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      return { url: result.secure_url, raw: result };
    } else if (filePath && filePath.buffer) {
      // multer memoryStorage
      const result = await new Promise((resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        upload_stream.end(filePath.buffer);
      });
      return { url: result.secure_url, raw: result };
    } else {
      throw new Error("Invalid file provided to uploadToCloudinary");
    }
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw new Error("File upload failed");
  }
};
