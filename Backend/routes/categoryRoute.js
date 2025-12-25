import express from "express";
import Category from "../models/category.model.js";

const router = express.Router();

// 🔹 CREATE CATEGORY
router.post("/create", async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    // Check duplicate
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    // Create category
    const category = await Category.create({ name: name.trim() });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });

  } catch (err) {
    console.error("Error creating category:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while creating category",
      error: err.message,
    });
  }
});

// 🔹 GET ALL CATEGORIES
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }); // latest first
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
      error: err.message,
    });
  }
});

export default router;
