import User from "../models/user.model.js";
import NotificationToken from "../models/NotificationToken.model.js";
import { sendNotificationToMultiple } from "../config/firebaseconfig.js";

export const sendAdminNotification = async (order,template) => {
  // 1️⃣ Active admins
  const admins = await User.find({
    role : {
      enum : "admin",
      isActive: true
    }
  }).select("_id");

  if (!admins.length) {
    return { success: true, sentCount: 0 };
  }

  // 2️⃣ Admin tokens (WEB, mobile — jo bhi ho)
  const tokenDocs = await NotificationToken.find({
    userId: { $in: admins.map(a => a._id) },
    isActive: true
  }).select("token -_id");

  const tokens = tokenDocs.map(t => t.token).filter(Boolean);

  if (!tokens.length) {
    return { success: true, sentCount: 0 };
  }

  // 3️⃣ SINGLE multicast call (THIS is the point)
  const payload = {
    title : template.title,
    body : template.body,
    data: {
      ...data,
      role: "admin"
    },
    order,
  };

  const result = await sendNotificationToMultiple(tokens, payload);

  return {
    success: true,
    sentCount: result.successCount,
    failureCount: result.failureCount
  };
};
