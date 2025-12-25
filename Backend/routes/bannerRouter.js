import express from "express";
import multer from "multer";
import bannerModel from "../models/banner.model.js";
import { uploadToCloudinary } from "../config/Cloudinary.js";

const router = express.Router();

// --- Multer setup for file upload (temporary memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// -------------------- CREATE BANNER --------------------
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
        });
    }

    let imageUrl = "";
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file);
      imageUrl = uploadResult?.url || "";
    }

    const banner = new bannerModel({
      name,
      image: imageUrl
    });

    await banner.save();

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Create banner error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create banner",
      error: error.message,
    });
  }
});

// -------------------- GET ALL BANNERS --------------------
router.get("/", async (req, res) => {
  try {
    const banners = await bannerModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: error.message,
    });
    console.log("bannerfetching err")
  }
});

// -------------------- DELETE BANNER --------------------
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await bannerModel.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete banner",
      error: error.message,
    });
  }
});

export default router;
