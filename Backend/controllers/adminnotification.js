    import User from "../models/user.model.js";
import { sendOrderNotification } from "../controllers/pushnotification.js";

// ✅ Send notification to all admin users
export const sendAdminNotification = async (title, body, data = {}) => {
  try {
    console.log("📢 Sending admin notification...");
    
    // Get all admin users
    const adminUsers = await User.find({ 
      isAdmin: true,
      isActive: true // If you have isActive field
    }).select('_id name phoneNumber');
    
    if (adminUsers.length === 0) {
      console.log("ℹ️ No admin users found");
      return { success: false, message: "No admin users found" };
    }
    
    console.log(`📋 Found ${adminUsers.length} admin user(s)`);
    
    let successCount = 0;
    let failureCount = 0;
    const results = [];
    
    // Send to each admin
    for (const admin of adminUsers) {
      try {
        const result = await sendOrderNotification(
          admin._id,
          title,
          body,
          {
            ...data,
            role : "admin",
            adminId: admin._id.toString()
          }
        );
        
        if (result.success) {
          successCount++;
          console.log(`✅ Sent to admin: ${admin.name || admin.phoneNumber}`);
        } else {
          failureCount++;
          console.log(`❌ Failed for admin ${admin._id}: ${result.error}`);
        }
        
        results.push({
          adminId: admin._id,
          name: admin.name,
          phoneNumber: admin.phoneNumber,
          ...result
        });
        
      } catch (error) {
        failureCount++;
        console.error(`🚨 Error for admin ${admin._id}:`, error.message);
        results.push({
          adminId: admin._id,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      message: `Admin notifications: ${successCount} sent, ${failureCount} failed`,
      summary: {
        totalAdmins: adminUsers.length,
        successCount,
        failureCount
      },
      results
    };
    
  } catch (error) {
    console.error("🚨 Admin notification system error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ Send new order notification to admin
export const sendNewOrderAdminAlert = async (order) => {
  try {
    const orderAmount = order.totalAmount || 0;
    const itemsCount = order.items?.length || 0;
    
    const notificationResult = await sendAdminNotification(
      "🆕 New Order Received!",
      `Order #${order.orderNumber} • ₹${orderAmount} • ${itemsCount} item(s)`,
      {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        type: "NEW_ORDER",
        screen: "OrderDetails",
        urgency: "high",
        totalAmount: orderAmount,
        itemsCount: itemsCount,
        userId: order.userId.toString()
      }
    );
    
    // Also log to console for immediate visibility
    console.log(`📦 NEW ORDER #${order.orderNumber} - ₹${orderAmount}`);
    console.log(`Customer: ${order.userId}`);
    console.log(`Admin notified: ${notificationResult.summary?.successCount || 0} admin(s)`);
    
    return notificationResult;
    
  } catch (error) {
    console.error("❌ New order admin alert failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ✅ Send order status update to admin 
// cancelled, delivered, ready, out_for_delivery ager order model ma status change karo to ya function call ho ga
export const sendOrderStatusUpdateToAdmins = async (order, oldStatus, newStatus) => {
  try {
    const statusMessages = {
      'cancelled': `Order #${order.orderNumber} has been cancelled`,
      'delivered': `Order #${order.orderNumber} has been delivered`,
      'ready': `Order #${order.orderNumber} is ready for pickup`,
      'out_for_delivery': `Order #${order.orderNumber} is out for delivery`
    };
    
    const message = statusMessages[newStatus];
    if (!message) {
      return { success: true, message: "No admin notification needed for this status" };
    }
    
    const result = await sendAdminNotification(
      `📊 Order ${newStatus.toUpperCase()}`,
      message,
      {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        type: `ORDER_${newStatus.toUpperCase()}`,
        screen: "AdminOrders",
        oldStatus,
        newStatus,
        timestamp: new Date().toISOString()
      }
    );
    
    return result;
    
  } catch (error) {
    console.error("Admin status update notification failed:", error);
    return { success: false, error: error.message };
  }
};

