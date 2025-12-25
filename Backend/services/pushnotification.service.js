import NotificationToken from "../models/NotificationToken.model.js";
import {
  sendNotification as firebaseSendNotification,
  sendNotificationToMultiple as firebaseSendMulticast,
} from "../config/firebaseconfig.js";
import { processFailedResponses } from "../controllers/pushnotification.js";
import { markTokenInactive } from "../controllers/deviceController.js";
import { sendAdminNotification } from "../services/sendadminnotification.service.js";

export const sendOrderNotificationService = async ({
  order,
  data,
}) => {
const { userId, body, orderId } = order;
    
    if (!order || !data) {
      throw new Error("order and notificationType are required");
    }
  const templates = {
    ORDER_CONFIRMED:{
    title : "📦 Order Confirmed",
    body : "Your order has been confirmed and is being prepared within 30 minutes.",
    data : {orderId: String(orderId), notificationType: "ORDER_CONFIRMED"}
    },
    ORDER_PREPARE:{
    title : "📦 Order Prepearing",
    body  : "Your Order Prepared in 10 minutes",
    data : {orderId: String(orderId), notificationType: "ORDER_PREPARE"}

    },
    ORDER_PACKED:{
    title : "📦 Your Order Packed",
    body : "Rider is getting your order ready for pickup.",
    data : {orderId: String(orderId), notificationType: "ORDER_PACKED"}
    },
    ORDER_ON_THE_WAY:{
    title : "🚚 Order On The Way",
    body  :"Rider went to deliver your order,Rider Call you in 5 minute"
    },
    ORDER_DELIVERED: {
      title: "📦 Order Delivered!",
      body: `Order #${body} has been delivered.`,
      data: { orderId: String(orderId), notificationType: "ORDER_DELIVERED" },
    },
    ORDER_CANCELED: {
      title: "📦 Order Cancelation!",
      body: `We ara Sorry to cancel your order Order #${body}.`,
      data: { orderId: String(orderId), notificationType: "ORDER_CANCELED" },
    },

  };

  const template = templates[data.notificationType];
  if (!template) {
    throw new Error(`Unknown notification type: ${data.notificationType}`);
  }

  // 🔔 ADMIN notification
  if (data.notificationType === "NEW_ORDER_ADMIN") {
     return await sendAdminNotification(order , template);
  }

  // 👤 CUSTOMER tokens
  const tokenDocs = await NotificationToken.find({
    userId,
    isActive: true,
  }).select("token");

  const tokens = tokenDocs.map(t => t.token);

  if (tokens.length === 0) {
    return { success: false, message: "No active devices" };
  }

  // Single device
  if (tokens.length === 1) {
    const response = await firebaseSendNotification(tokens[0], template);
    if (!response.success) {
      await markTokenInactive(tokens[0]);
    }
    return response;
  }
 else if(tokens.length > 1 ){
    // Multiple devices
    const multicast = await firebaseSendMulticast(tokens,template);
    await processFailedResponses(tokens, multicast.responses);
    return multicast;
  }
};
