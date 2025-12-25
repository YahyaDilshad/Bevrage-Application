import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Global variable to store Firebase app instance
let connectionFirebase = null;
let firebaseMessaging = null;

// Initialize Firebase
function initializeFirebase() {
  try {
    console.log("🔄 Initializing Firebase...");
    
    // 1. Check required environment variables
    if (!process.env.PROJECT_ID) {
      console.log("PROJECT_ID environment variable missing  in firebase config file")
      throw new Error("PROJECT_ID environment variable missing");
    }
    
    if (!process.env.CLIENT_EMAIL) {
      console.log("CLIENT_EMAIL environment variable missing in firebase config file")
      throw new Error("CLIENT_EMAIL environment variable missing");
    }
    
    if (!process.env.PRIVATE_KEY_FIREBASE) {
      console.log("PRIVATE_KEY_FIREBASE environment variable missing in firebase config file")
      throw new Error("PRIVATE_KEY_FIREBASE environment variable missing");
    }
    
    // 2. Format private key
    const privateKey = process.env.PRIVATE_KEY_FIREBASE.replace(/\\n/g, "\n");
    
    // 3. Initialize Firebase Admin SDK
    connectionFirebase = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    
    // 4. Get messaging instance (brain of push notification on firebase)
    firebaseMessaging = connectionFirebase.messaging();
    
    console.log("✅ Firebase initialized successfully");
    return true;
    
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error.message);
    
    // Don't crash in production
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ App running without Firebase notifications");
      return false;
    } else {
      // Throw error in development
      throw error;
    }
  }
}
initializeFirebase()
// Get messaging instance (for sending notification to firebase cloud messaging)
function getMessaging() {
  // ager firebase ko messag krna messaging() initialize nahi hai to error throw karo
  if (!firebaseMessaging) {
    console.log("⚠️ Firebase Messaging not initialized");
    throw new Error("Firebase not initialized. Call initializeFirebase() first");
    
  }
  return firebaseMessaging;
}
// Get app instance 
function getApp() {
  // ager firebase app initialized nahi hai to error throw karo
  if (!connectionFirebase) {
    throw new Error("Firebase not initialized. Call initializeFirebase() first");
  }
  return connectionFirebase;
}

// Send notification function (for single user)
async function sendNotification(token, template) {
  try {
    const messaging = getMessaging();
    
    const message = {
      token: token,
      notification: {
        title: template.title || "New Notification",
        body: template.body || "You have a new update",
      },
      data: template.data || {},
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "beverages_channel", // important for android : jo channel ko name react native app ma dia hoga
          // wahi name jo exact channel Id ma likhna hai nahi to fail hoga 
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };
    
    const response = await messaging.send(message);
    console.log("📤 Notification sent successfully:", response);
    return { success: true, messageId: response };
    
  } catch (error) {
    console.error("📤 Notification send failed:", error.message);
    
    // Handle specific errors
    if (error.code === "messaging/invalid-registration-token") {
      console.log("⚠️ Invalid token, marking as inactive");
      // You can call your function to mark token inactive here
    }
    
    return { success: false, error: error.message };
  }
}

// Send to multiple devices
async function sendNotificationToMultiple(tokens,  payload) {
  try {
    if(!tokens || tokens.length === 0) {
      return { success: false, error: "No tokens provided" };
    }
    
    const messaging = getMessaging();
    
    const message = {
      tokens, // Array of tokens
      notification: {
        title: payload.title || "New Notification", 
        body: payload.body || "You have a new update",
      },
      data: payload.data || {},
    };
    // send message to all users 
    const response  = await messaging.sendMulticast(message);

    // Check results
    const results = {
      successCount: response.successCount, // success count 
      failureCount: response.failureCount, // faliure count
      responses: response.responses, // both responses (success and faliure)
    };
    
    // Process failed tokens
    //ager responses ka ander faliure count 0 sa zyada hai to failed tokens ko nikal lo and failedtoken variable ma uska idx and error save kr do  
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((res , idx) => {
        if (!res.success) {
          failedTokens.push({
            token: tokens[idx],
            error: res.error,
          });
        }
      });
      
      results.failedTokens = failedTokens;
    }
    
    return { success: true, ...results };
    
  } catch (error) {
    console.error("Multicast notification failed:", error);
    return { success: false, error: error.message };
  }
}

const DEFAULT_TOPICS = ["promotions", "new_arrivals", "launches" , "offers"];

// Send to topic ye function ka use signup and sign in page pr hoga jaisa hi
// user signin ya sign up kare ga to subscribe ho gye ga uska topics saara 
  async function sendNotificationToTopic(deviceToken) {
  try {
    const messaging = getMessaging();
    const results = [];
    
    // subscribe in parallel
    const promises = DEFAULT_TOPICS.map(topic => messaging.subscribeToTopic(deviceToken, topic));
    const responses = await Promise.all(promises);
    results.push(...responses)
    console.log(`✅ Subscribed to topic during login user "${topic}":`, responses); 
    return { success: true, responses };     
  } catch (error) {
    console.error("Topic notification failed:", error);
    return { success: false, error: error.message };
  }
}
// Check if Firebase app and firebasemessaging is initialized ager nahi hai false return karega  
function isInitialized() {
  return connectionFirebase !== null && firebaseMessaging !== null;
}

// Cleanup function
async function cleanupFirebase() {
  if (connectionFirebase) {
    await connectionFirebase.delete();
    connectionFirebase = null;
    firebaseMessaging = null;
    console.log("🧹 Firebase cleaned up");
  }
}
async function removefirebaseconnection(){
   process.on("SIGINT", async () => {
  await cleanupFirebase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await cleanupFirebase();
  process.exit(0);
});

}

removefirebaseconnection()
// Export all functions
export {
  getMessaging,
  getApp,
  sendNotification,
  sendNotificationToMultiple,
  sendNotificationToTopic,
  isInitialized,
};
