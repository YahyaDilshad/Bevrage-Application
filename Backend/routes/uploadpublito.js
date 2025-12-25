import express from "express";
import multer from "multer";
import { uploadToCloudinary } from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // use memoryStorage

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const result = await uploadToCloudinary(file);
    res.json({ success: true, url: result.url, raw: result.raw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
