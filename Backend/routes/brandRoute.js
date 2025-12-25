
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import Brand from "../models/brand.model.js";
import Product from "../models/product.model.js";
import { uploadToCloudinary } from "../config/publito.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// 🔹 CREATE BRAND
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { name, category } = req.body;

    // Validate
    if (!name?.trim() || !category) {
      return res.status(400).json({ success: false, message: "Name and category are required" });
    }

    // Check duplicate
    const existingBrand = await Brand.findOne({ name: name.trim(), category });
    if (existingBrand) {
      return res.status(400).json({ success: false, message: "Brand already exists in this category" });
    }

    let imageObj = { url: "", public_id: "" };
    if (req.file) {
      try {
        const uploadRes = await uploadToCloudinary(req.file);
        imageObj.url = uploadRes?.url || "";
        imageObj.public_id = uploadRes?.raw?.public_id || "";
      } catch (err) {
        console.error("Cloudinary brand upload error:", err);
        return res.status(500).json({ success: false, message: "Failed to upload brand image" });
      }
    }

    const brand = await Brand.create({
      name: name.trim(),
      image: imageObj,
      category,
    });

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      brand,
    });
  } catch (err) {
    console.error("Error creating brand:", err);
    res.status(500).json({
      success: false,
      message: "Server error while creating brand",
      error: err.message,
    });
  }
});

// 🔹 GET ALL BRANDS
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: brands.length,
      brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ success: false, message: "Failed to fetch brands" });
  }
});

// 🔹 GET ALL PRODUCTS OF A SPECIFIC BRAND
router.get("/:brandId/product", async (req, res) => {
  try {
    const { brandId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({ success: false, message: "Invalid brand ID" });
    }

    const products = await Product.find({ brand: brandId })
      .populate("brand", "name")
      .populate("category", "name");

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching brand products:", error);
    res.status(500).json({ success: false, message: "Server error while fetching products" });
  }
});

export default router;
