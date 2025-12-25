import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Category-wise analytics
router.get("/category", async (req, res) => {
  try {
    const data = await Product.aggregate([
      {
        // $lookup means join between 2 collections  
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData" // jo bhi data aiga categories ka ander sa sa wo is ma save hoga 
        }
      },
      { $unwind: "$categoryData" },
      {
        $group: {
          _id: "$categoryData.name",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalSold: { $sum: "$sold" },
          avgPrice: { $avg: "$price" }
        }
      },
      {
        $sort: { totalSold: -1 } // best-selling categories first (-1 means bade sa chota and +1 mtlb chota sa bada )
      }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Sales report (total revenue) price * soldItems
router.get("/sales", async (req, res) => {
  try {
    const salesReport = await Product.aggregate([
      {
        // project stage define which seen on the frontend   
        $project: {
          name: 1, // 1 means include name field 
          revenue: { $multiply: ["$price", "$sold"] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" },
          totalProducts: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, data: salesReport[0] });
  } catch (error) {
    console.error("sales report err" , error.message);
    res.status(500).json({ success: false, message: "sales report err" });
  }
});

export default router;
