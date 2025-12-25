import Order from "../models/order.model.js";
import User from "../models/user.model.js"; // Import User model for admin functions
import { 
  sendOrderNotification
} from "../controllers/pushnotification.js";


// ✅ Get all admin users and check is admin active or not in sendNewOrderAlertToAdmins function  
const getAdminUsers = async () => {
  try {
    return await User.find({ 
      role:{
        enum : "admin",
        isActive: true 
      } 
    }).select('_id fullname phone');
  } catch (error) {
    console.error("Error getting admin users:", error.message);
    return [];
  }
};

// ✅ Send order notification to single user like order confirmed ,order paked ,Order ready   
const sendNotificationToUser = async (userId, orderId, title, body, data = {}) => {
  try {
    return await sendOrderNotification(
      userId,
      orderId,
      title,
      body,
      data
    );
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
    return { success: false, error: error.message };
  }
};

// ✅ Send new order alert to all admins
const sendNewOrderAlertToAdmins = async (order) => {
  try {
    const adminUsers = await getAdminUsers(); // this function check is admin active or not
    
    if (adminUsers.length === 0) {
      console.log("ℹ️ No admin users found");
      return { success: true, sentCount: 0, totalAdmins: 0 };
    }
    
    let successCount = 0;
    const results = [];
    
    for (const admin of adminUsers) {
      try {
        const result = await sendNotificationToUser(
          admin._id,
          {
            title : "🆕 New Order Received!",
            body : `Order #${order.orderNumber  } • ₹${order.totalAmount} • ${order.items?.length || "item are given but length not found"} item(s)`,
            orderId: order._id.toString(),
            data: { orderId: String(order._id), notificationType: "NEW_ORDER_ADMIN" },
            screen: "AdminAlert",
            urgency: "high"
          }
        );
        
        if (result.success) {
          successCount++;
        }
        //mtlb jis admin ko notification message ja raha hai use result object ma push kr do 
        results.push({
          adminId: admin._id,
          name: admin.name,
          success: result.success
        });
        
      } catch (adminError) {
        console.error(`Failed to notify admin ${admin._id}:`, adminError.message);
        results.push({
          adminId: admin._id,
          name : admin.name,
          success: false,
          error: adminError.message
        });
      }
    }
    
    console.log(`📢 New order alert sent to ${successCount}/${adminUsers.length} admin(s)`);
    
    return {
      success: successCount > 0,
      sentCount: successCount,
      totalAdmins: adminUsers.length,
      results
    };
    
  } catch (error) {
    console.error("New order admin alert error:", error);
    return { success: false, error: error.message };
  }
};

// ✅ Send order status update to admins (for important changes)
export const sendStatusUpdateToAdmins = async (order, oldStatus, newStatus) => {
  try {
    // Only notify admins for important status changes
    const importantStatuses = ['cancelled', 'delivered'];
    if (!importantStatuses.includes(newStatus)) {
      return { success: true, message: "No admin notification needed" };
    }
    
    const adminUsers = await getAdminUsers();
    
    if (adminUsers.length === 0) {
      return { success: true, sentCount: 0 };
    }
    
    const statusMessages = {
      'cancelled': `Order #${order.orderNumber} has been cancelled`,
      'delivered': `Order #${order.orderNumber} has been delivered`
    };
    
    const title = `📊 Order ${newStatus.toUpperCase()}`;
    const body = statusMessages[newStatus] || `Order #${order.orderNumber} status changed to ${newStatus}`;
    
    let successCount = 0;
    
    for (const admin of adminUsers) {
      try {
        const result = await sendNotificationToUser(
          admin._id,
          title,
          body,
          {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            type: `ORDER_${newStatus.toUpperCase()}_ADMIN`,
            screen: "AdminOrders",
            oldStatus,
            newStatus
          }
        );
        
        if (result.success) successCount++;
        
      } catch (error) {
        console.error(`Admin status update failed for ${admin._id}:`, error.message);
      }
    }
    
    return {
      success: successCount > 0,
      sentCount: successCount,
      totalAdmins: adminUsers.length
    };
    
  } catch (error) {
    console.error("Status update to admins error:", error);
    return { success: false, error: error.message };
  }
};

// -------------------- CREATE ORDER --------------------
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required"
      });
    }

    if (!totalAmount || totalAmount === 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total amount is required"
      });
    }

    console.log(`📦 Creating order for user: ${userId}, Items: ${items.length}, Amount: ₹${totalAmount}`);

    // Create order
    const newOrder = await Order.create({
      userId,
      items,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.address || "Not specified",
      paymentMethod: paymentMethod || 'Cash Payment',
      status: 'pending'
    });

    console.log(`✅ Order created: #${newOrder.userId}`);

    // ✅ 1. Send notification to CUSTOMER 
    let customerNotification = { success: false, error: null };
    try {
      customerNotification = await sendOrderNotification(
        userId,
        {
          orderId: newOrder._id.toString(),
          orderNumber: newOrder.orderNumber,
          notificationType: 'ORDER_CONFIRMED',
          screen: 'OrderDetails',
          action: 'VIEW_ORDER',
          totalAmount: totalAmount
        }
      );
      
      console.log(`📤 Customer notification: ${customerNotification.success ? 'Sent notification Successful  ✅' : 'Failed to send order notification to user ❌'}`);
      
    }catch (customerError) {
      console.error("❌ Customer notification failed:", customerError.message);
      customerNotification.error = customerError.message;
    }

    // ✅ 2. Send NEW ORDER ALERT to ALL ADMINS
    let adminNotification = { success: false, sentCount: 0, totalAdmins: 0 };
    try {
      adminNotification = await sendNewOrderAlertToAdmins(newOrder);
      console.log(`📢 Admin notifications: ${adminNotification.sentCount}/${adminNotification.totalAdmins} sent`);
    } catch (adminOrderError) {
      console.error("❌ Admin notification failed:", adminOrderError.message);
      adminNotification.error = adminOrderError.message;
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        _id: newOrder._id,
        items: newOrder.items,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        createdAt: newOrder.createdAt
      },
      notifications: {
        customer: {
          sent: customerNotification.success,
          message: customerNotification.success ? 
            "Order confirmation sent to your device" : 
            "Failed to send notification"
        },
        
        admin: {
          sent: adminNotification.success,
          sentTo: adminNotification.sentCount,
          totalAdmins: adminNotification.totalAdmins,
          message: adminNotification.success ? 
            `Alert sent to ${adminNotification.sentCount} admin(s)` : 
            "Failed to alert order notifiaction to admins"
        }
      }
    });

  } catch (error) {
    console.error("🚨 Order creation error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Order creation failed",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// -------------------- GET USER ORDERS () --------------------
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;
    
    // Build filter
    const filter = { userId };
    if (status && status !== 'all') {
      filter.status = status;
    }
    // Get counts for summary
    const totalOrders = await Order.countDocuments({ userId });

    const statusCounts = {
      confirmed: await Order.countDocuments({ userId, status: 'ORDER_CONFIRMED' }),
      preparing: await Order.countDocuments({ userId, status: 'ORDER_PREPARE' }),
      Paked: await Order.countDocuments({ userId, status: 'ORDER_PACKED' }),
      out_for_delivery: await Order.countDocuments({ userId, status: 'ORDER_ON_THE_WAY' }),
      delivered: await Order.countDocuments({ userId, status: 'ORDER_DELIVERED' }),
      cancelled: await Order.countDocuments({ userId, status: 'ORDER_CANCELED' })
    };
    res.status(200).json({
      success: true,
      summary: {
        total: totalOrders,
        ...statusCounts
      }
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// -------------------- GET ORDER BY ID (show hoga UI pr order page pr specific user ka orders ka data and admin ko show hoga jub wo search karega) --------------------
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.isAdmin;

    const order = await Order.findById(orderId)
      .populate("userId", "name email phone address")
      .select('-__v');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check authorization
    const isOwner = order.userId._id.toString() === userId.toString();
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order"
      });
    }

    // Format response based on user type
    const orderResponse = {
      _id: order._id,
      orderNumber: order.orderNumber,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      statusHistory: order.statusHistory || [],
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      specialInstructions: order.specialInstructions,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    // Add admin-only fields
    if (isAdmin) {
      orderResponse.user = order.userId;
      orderResponse.cancellationReason = order.cancellationReason;
      orderResponse.cancelledAt = order.cancelledAt;
      orderResponse.cancelledBy = order.cancelledBy;
      orderResponse.deliveredAt = order.deliveredAt;
    }

    res.status(200).json({
      success: true,
      order: orderResponse,
      permissions: {
        canCancel: isOwner && ['pending', 'confirmed', 'preparing'].includes(order.status),
        canUpdateStatus: isAdmin,
        isOwner,
        isAdmin
      }
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// -------------------- UPDATE ORDER STATUS (ADMIN) --------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { status , cancellationReason } = req.body;
    const orderId = req.params.id;

    // verify if user is admin 
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    if(!cancellationReason){
      return res.status(400).json("Please require Cancelation reason")
    }
    // Validate status jo validStatuses ka ander jo request.body sa aya
    // ager wo status include nahi hai validatestatuses ma to invalid status ka message jai ga  
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready to pack', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
      });
    }

    // Find order ager order Id nahi hai to message jaiga "orde not found ka"
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Store old status 
    const oldStatus = order.status;
    
    // Don't allow updating to same status 
    if (oldStatus === status) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${status}`
      });
    }
    
    // Validate status transition
    const validTransitions = {
      'ORDER_CONFIRMED': ['ORDER_PREPARE', 'ORDER_CANCELED'],
      'ORDER_PREPARE': ['ORDER_PACKED', 'ORDER_CANCELED'],
      'ORDER_PACKED': ['ORDER_ON_THE_WAY', 'ORDER_CANCELED'],
      'ORDER_ON_THE_WAY': ['ORDER_DELIVERED', 'ORDER_CANCELED'],
      'ORDER_DELIVERED': [],
      'ORDER_CANCELED': []
    };
    
    if (!validTransitions[oldStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${oldStatus} to ${status}`
      });
    }
    
    // Update order
      order.status = status;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      changedByName: req.user.name || 'Admin'
    });
     
    // Handle special cases
    if (status === 'ORDER_CANCELED') {
      order.cancellationReason = cancellationReason;
      order.cancelledAt = new Date();
      order.cancelledBy = req.user._id;
    }
    
    if (status === 'ORDER_DELIVERED') {
      order.deliveredAt = new Date();
    }
    const notificationType = status
    await order.save();
    console.log(`🔄 Order ${order.orderNumber} status: ${oldStatus} → ${status}`);

    // ✅ 1. Send notification to User
    let customerNotification = { success: false, message: "Not sent" };
    try {
      const notificationType = customerNotification[status];
      if (notificationType) {
        customerNotification = await sendOrderNotification(order, notificationType);
        console.log(`📤 Customer notification (${notificationType}): ${customerNotification.success ? 'Sent status update notification' : 'Failed status update notification status '}`);
      }
    } catch (notifError) {
      console.warn(`⚠️ Customer notification failed in update notificationType:`, notifError.message);
      customerNotification.error = notifError.message;
    }

   
    }catch(error){
       console.log(error)  
    }
    }
// -------------------- ADMIN GET ALL ORDERS --------------------
export const getAllOrders = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    if (req.query.search) {
      // Search by order number
      filter.orderNumber = { $regex: req.query.search, $options: 'i' };
    }

    // Get orders with pagination
    const orders = await Order.find(filter)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination info
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    // Statistics
    const stats = {
      total: totalOrders,
      byStatus: {
        pending: await Order.countDocuments({ ...filter, status: 'pending' }),
        confirmed: await Order.countDocuments({ ...filter, status: 'confirmed' }),
        preparing: await Order.countDocuments({ ...filter, status: 'preparing' }),
        ready: await Order.countDocuments({ ...filter, status: 'ready' }),
        out_for_delivery: await Order.countDocuments({ ...filter, status: 'out_for_delivery' }),
        delivered: await Order.countDocuments({ ...filter, status: 'delivered' }),
        cancelled: await Order.countDocuments({ ...filter, status: 'cancelled' })
      },
      today: {
        orders: await Order.countDocuments({
          ...filter,
          createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
        }),
        revenue: await Order.aggregate([
          { 
            $match: { 
              ...filter,
              createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
              status: { $ne: 'cancelled' }
            }
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0)
      }
    };

    res.status(200).json({
      success: true,
      orders,
      stats,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// -------------------- GET ORDER STATISTICS --------------------
export const getOrderStatistics = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Common aggregation pipeline
    const revenuePipeline = (matchFilter) => [
      { $match: { ...matchFilter, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ];

    const stats = {
      today: {
        orders: await Order.countDocuments({ createdAt: { $gte: startOfToday } }),
        revenue: await Order.aggregate(revenuePipeline({ createdAt: { $gte: startOfToday } }))
          .then(result => result[0]?.total || 0)
      },
      thisWeek: {
        orders: await Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
        revenue: await Order.aggregate(revenuePipeline({ createdAt: { $gte: startOfWeek } }))
          .then(result => result[0]?.total || 0)
      },
      thisMonth: {
        orders: await Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        revenue: await Order.aggregate(revenuePipeline({ createdAt: { $gte: startOfMonth } }))
          .then(result => result[0]?.total || 0)
      },
      thisYear: {
        orders: await Order.countDocuments({ createdAt: { $gte: startOfYear } }),
        revenue: await Order.aggregate(revenuePipeline({ createdAt: { $gte: startOfYear } }))
          .then(result => result[0]?.total || 0)
      },
      allTime: {
        orders: await Order.countDocuments(),
        revenue: await Order.aggregate(revenuePipeline({}))
          .then(result => result[0]?.total || 0)
      },
      statusDistribution: {
        pending: await Order.countDocuments({ status: 'pending' }),
        confirmed: await Order.countDocuments({ status: 'confirmed' }),
        preparing: await Order.countDocuments({ status: 'preparing' }),
        ready: await Order.countDocuments({ status: 'ready' }),
        out_for_delivery: await Order.countDocuments({ status: 'out_for_delivery' }),
        delivered: await Order.countDocuments({ status: 'delivered' }),
        cancelled: await Order.countDocuments({ status: 'cancelled' })
      }
    };

    res.status(200).json({
      success: true,
      stats,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};