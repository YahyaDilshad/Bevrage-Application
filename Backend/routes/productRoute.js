import express from "express";
import multer from "multer";
import Product from "../models/product.model.js";
import { uploadToCloudinary } from "../config/Cloudinary.js";
import mongoose from "mongoose";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ============================
   ✅ CREATE PRODUCT (with image upload)
============================ */
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { name, price, brand, category, stock, discount, description } = req.body;

    // Validation
    if (!name || price == null || !brand || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (name, price, brand, category)",
      });
    }

    // Upload image if available
    let imageUrl = "";
      if (req.file) {
        try {
          const uploadRes = await uploadToCloudinary(req.file);
          imageUrl = uploadRes?.url || "";
        } catch (uploadErr) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload image to Cloudinary",
            error: uploadErr.message,
          });
        }
    }

    // Save to DB
    const product = new Product({
      name,
      price,
      brand,
      category,
      stock,
      discount,
      description,
      image: imageUrl || "",
    });

    await product.save();
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating product",
      error: error.message,
    });
  }
});


/* ============================
   ✅ GET ALL PRODUCTS
============================ */
router.get("/", async (req, res) => {
  try {
    const { category, brand, search } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate("brand", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ============================
   ✅ GET PRODUCTS (Alternative endpoint - /getproducts)
============================ */
router.get("/getproducts", async (req, res) => {
  try {
    const { category, brand, search } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate("brand", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ============================
   ✅ GET SINGLE PRODUCT BY ID
============================ */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const product = await Product.findById(id)
      .populate("brand", "name")
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ============================
   ✅ UPDATE PRODUCT
============================ */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("brand", "name")
      .populate("category", "name");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ============================
   ✅ DELETE PRODUCT
============================ */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
