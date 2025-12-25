import express from "express";
import { Product } from "../models/product.js";

const router = express.Router();


// ✅ 1. Total Products Count + Category-wise Count
router.get("/category-summary", async (req, res) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 }, // means add all products eg: I have four products 1+1+1+1 = 4   
          totalStock: { $sum: "$stock" }, // means sum of totalstock quantity 
          avgPrice: { $avg: "$price" },  // find mean value
        },
      },
      {
        // project stage define which seen on the frontend  
        $project: { 
          _id: 0,
          category: "$_id",
          totalProducts: 1, // 1 means include total product field (kitna product hai aik perticular category  ma )  
          totalStock: 1, // 1 means include total stock field (kitna stock hai aik perticular category ma )
          avgPrice: { $round: ["$avgPrice", 2] }, // means to convert nearest value 
        },
      },
    ]);

    const overall = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
        },
      },
    ]);

    res.json({ summary, overall: overall[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ 2. Low Stock Alert (Inventory Warning)
router.get("/low-stock", async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 10 } }); // 10 se kam stock
    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ 3. Top Selling Products (Dummy Example)
router.get("/top-products", async (req, res) => {
  try {
    // For demo: assume tumhare product schema me `sold` field hai
    const topProducts = await Product.find().sort({ sold: -1 }).limit(5);
    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ 4. Total Revenue (Based on Sold Items)
router.get("/revenue", async (req, res) => {
  try {
    const revenue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$price", "$sold"] } },
          totalSoldItems: { $sum: "$sold" },
        },
      },
    ]);

    res.json(revenue[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
