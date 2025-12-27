import { sendOrderNotificationService } from "../services/pushnotification.service.js";
// pushNotificationController.js
import {
  getMessaging,
  sendNotification as firebaseSendNotification,
  sendNotificationToMultiple as firebaseSendMulticast,
  isInitialized,
  sendNotificationToTopic,
} from "../config/firebaseconfig.js";
import NotificationToken from "../models/NotificationToken.model.js";
import {markTokenInactive} from "./deviceController.js"

/**
 * Helpers
 */

// Normalize tokens array and remove falsy values
function normalizeTokens(tokens) {
  if (!tokens) return [];
  if (!Array.isArray(tokens)) return [tokens];
  return tokens.filter(Boolean);
}
normalizeTokens();
// Check result responses for invalid tokens and mark them inactive
export const processFailedResponses = async(tokens, responses) => {
  // responses is array returned by messaging.sendMulticast -> each item has .success / .error
  const failedtoken = [];
  responses.forEach((res, idx) => {
    if (!res.success) {
      const token = tokens[idx];
      const err = res.error ? res.error.message || res.error.toString() : "Unknown error";
      failedtoken.push({ token, error: err });
      console.log("failedtokens in processfailed responces :" , failedtoken)
    }
  });

  // mark invalid tokens inactive in DB (non-blocking)
  await Promise.all(failed.map(async f => {
    const lower = (f.error || "").toLowerCase();
    if (lower.includes("invalid-registration-token") || lower.includes("notregistered") || lower.includes("registration-token-not-registered")) {
      try {
        await markTokenInactive(f.token); // implement in deviceController
      } catch (e) {
        console.warn("Failed to mark token inactive:", e.message);
      }
    }
  }));

  return failed;
}

/**
 * 1) Send notification to a single user (all his active devices).
 *    Exposed as an Express handler (req,res) or can be used as service by calling directly.
 *
 *    Expected: req.body = { userId, title, body, data }
 */
export const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title, body, data = {} } = req.body;

    if (!userId) {
      console.log('userId is not required in sendNotifiactionToUser Function inpushnootification js file')
      return res.status(400).json({ success: false, message: "userId is not required" });
      
    }

    // fetch active device tokens for the user
    const tokenDocs = await NotificationToken.find({ userId, isActive: true }).select("token -_id");
    const tokens = tokenDocs.map(d => d.token).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(200).json({ success: false, message: "User has no active devices", devices: 0 });
    }

    const notificationData = {
      title: title || "New Notification",
      body: body || "You have a new update",
      data: {
        ...data,
        type: data.type || "general",
        timestamp: new Date().toISOString(),
      },
    };
    let result;
    if (tokens.length === 1) {
      result = await firebaseSendNotification(tokens[0], notificationData);
      // normalize result structure
      if (!result.success) {
        // mark invalid token if known
        const err = (result.error || "").toLowerCase();
        if (err.includes("invalid-registration-token") || err.includes("notregistered")) {
          await markTokenInactive(tokens[0]);
        }
      }
      return res.status(200).json({
        success: result.success,
        message: result.success ? "Notification sent" : "Failed to send",
        result,
      });
    } else {
      // Use multicast if more than 1 token to be efficient
      // split into FCM-supported batches (sendMulticast supports up to 500 tokens)
      const batchSize = 500;
      const batches = [];
      for (let i = 0; i < tokens.length; i += batchSize) {
        batches.push(tokens.slice(i, i + batchSize));
      }

      const batchResults = [];
      for (const batchTokens of batches) {
        const r = await firebaseSendMulticast(batchTokens, notificationData);
        // r: { successCount, failureCount, responses }
        const failed = await processFailedResponses(batchTokens, r.responses || []);
        batchResults.push({
          batchSize: batchTokens.length,
          successCount: r.successCount,
          failureCount: r.failureCount,
          failed,
        });
      }

      const totalSuccess = batchResults.reduce((s, b) => s + b.successCount, 0);
      const totalFailure = batchResults.reduce((s, b) => s + b.failureCount, 0);

      return res.status(200).json({
        success: true,
        message: `Sent to ${totalSuccess} devices, ${totalFailure} failed`,
        summary: { totalDevices: tokens.length, totalSuccess, totalFailure, batches: batchResults },
      });
    }

  } catch (error) {
    console.error("sendNotificationToUser error:", error);
    return res.status(500).json({ success: false, message: "Failed to send notification", error: error.message });
  }
};

/**
 * 2) Order-related notifications (Express handler)
 *    Expected req.body = { order, notificationType, oldStatus? }
 *
 *    notificationType examples: 'ORDER_PLACED', 'ORDER_ACCEPTED', 'ORDER_PACKED',
 *    'ORDER_READY', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'NEW_ORDER_ADMIN'
 */

export const sendOrderNotification = async (req, res) => {
  try {
    const result = await sendOrderNotificationService(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Push notification error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


/*
  3) Bulk notification (Promotions / Announcements)
     Expected req.body = { userIds: [..], title, body, data }
     This function batches device tokens into 500-size FCM batches.
 */
export const sendBulkNotification = async (req, res) => {
  try {
    // 1️⃣ payload FIRST
    const { title, body, data = {}, userIds } = req.body;

    // 2️⃣ strict validation
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "title and body are required",
      });
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds array is required",
      });
    }

    // 3️⃣ get active tokens
    const tokenDocs = await NotificationToken.find({
      userId: { $in: userIds },
      isActive: true,
    }).select("token -_id");

    if (!tokenDocs.length) {
      return res.status(404).json({
        success: false,
        message: "No active devices found",
      });
    }

    const allTokens = tokenDocs
      .map(d => d.token)
      .filter(Boolean);

    // 4️⃣ Firebase-compatible payload
    const payload = {
      notification: {
        title,
        body,
      },
      data, // MUST be string values
    };

    // 5️⃣ batching
    const batchSize = 500;
    const results = [];

    for (let i = 0; i < allTokens.length; i += batchSize) {
      const tokens = allTokens.slice(i, i + batchSize);

      const response = await firebaseSendMulticast(
        tokens,
        payload
      );

      const failed = await processFailedResponses(
        tokens,
        response.responses || []
      );

      results.push({
        batch: i / batchSize + 1,
        batchSize: tokens.length,
        successCount: response.successCount,
        failureCount: response.failureCount,
        failed,
      });

      // throttle
      if (i + batchSize < allTokens.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    return res.status(200).json({
      success: true,
      message: "Bulk notifications sent",
      totalDevices: allTokens.length,
      batches: results.length,
      results,
    });

  } catch (error) {
    console.error("sendBulkNotification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send bulk notifications",
      error: error.message,
    });
  }
};


/**
 * 4) Test notification endpoint
 *    Expected req.body = { token, title?, body? }
 */
export const testNotification = async (req, res) => {
  try {       
    const { token, title = "Test Notification", body = "This is a test notification" } = req.body || {};
    if (!token) return res.status(400).json({ success: false, message: "Device token is required" });

    const result = await firebaseSendNotification(token, {
      title,
      body,
      data: { type: "TEST", timestamp: new Date().toISOString(), test: "1" },
    });

    return res.status(200).json({ success: result.success, result });
  } catch (error) {
    console.error("testNotification error:", error);
    return res.status(500).json({ success: false, message: "Test failed", error: error.message });
  }
};

/**
 * 6) Auto-subscribe helper (call at signup/signin)
 *    This function uses getMessaging() directly because firebaseconfig's subscribe function is buggy.
 *    Usage: await autoSubscribeUserTopics(deviceToken);
 */
export const autoSubscribeUserTopics = async (deviceToken) => {
  try {
    if (!deviceToken){
      console.log("DeviceToken is not required during sign in or signup")
       return err.message("deviceToken required");}
     sendNotificationToTopic(deviceToken)

  } catch (error) {
    console.error("autoSubscribeUserTopics error:", error);
    return { success: false, error: error.message };
  }
};
