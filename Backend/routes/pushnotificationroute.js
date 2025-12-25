import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/orderController.js";
import {
  sendBulkNotification
} from "../controllers/pushnotification.js"
import { protect , adminOnly } from "../middleware/auth.js";

const router = express.Router();

// ---------------- USER order related ROUTES ----------------
router.post("/create", protect, createOrder);         // User places order (when user create an order in app to call this route)
router.get("/my-orders", protect, getMyOrders);       // User's own orders list (user seen all order status in app)
router.get("/:id", protect, getOrderById);            // User order detail for admin dashboard
router.post('/bulknotifiaction' , protect , sendBulkNotification ) // when give any announcement to all users on the dashboard this function call  
// ---------------- ADMIN ROUTES ----------------
router.put("/update-status/:id", protect, adminOnly , updateOrderStatus); // Admin update status
router.get("/admin/all", protect, adminOnly , getAllOrders);              // Admin get all orders

export default router;
