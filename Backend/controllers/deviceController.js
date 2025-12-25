import NotificationToken from "../models/NotificationToken.model.js";

// ✅ 1. SAVE DEVICE TOKEN
// ye function user ka device token save krta hai jab wo app me login krta hai ya app open krta hai 
export const saveDeviceToken = async (req, res) => {
  try {
    const { token, deviceType = "android", deviceId, deviceName } = req.body;
    const userId = req.user._id;

    // Validation
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Device token is required"
      });
    }

    // Check token length (FCM tokens are 152-165 chars)
    if (token.length < 100 || token.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Invalid token format"
      });
    }

    console.log(`📱 Saving device token for user: ${userId}`);

    // Check if same token exists same devices 
    const existingToken = await NotificationToken.findOne({ token });
    
    if (existingToken) {
      // If token belongs to different user, deactivate it
      if (existingToken.userId.toString() !== userId.toString()) {
        console.log(`🔄 Token reused by different user, deactivating old`);
        existingToken.isActive = false;
        existingToken.lastActiveAt = new Date();
        await existingToken.save();
      } else {
        // Same user, same token - just update timestamp
        existingToken.lastActiveAt = new Date();
        existingToken.isActive = true;
        await existingToken.save();
        
        return res.status(200).json({
          success: true,
          message: "Token already exists, updated timestamp",
          device: existingToken
        });
      }
    }

    // Create new token entry
    const deviceToken = await NotificationToken.create({
      userId,
      token,   // FCM real token
      deviceType, // android , ios, web
      deviceId, // unique device identifier
      deviceName, // User's device name
      isActive: true,
      lastActiveAt: new Date()
    });

    console.log(`✅ Device token saved for ${deviceType}`);

    res.status(201).json({
      success: true,
      message: "Device token saved successfully",
      device: deviceToken
    });

  } catch (error) {
    console.error("❌ Error saving device token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save device token",
      error: error.message
    });
  }
};
// Helper function to mark token inactive
export const markTokenInactive = async (token) => {
  return NotificationToken.findOneAndUpdate(
    { token },
    { isActive: false, lastActiveAt: new Date() }
  );
};

// ✅ 2. REMOVE DEVICE TOKEN (User app account logout or uninstall kare token remove)
export const  removeDeviceToken = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user._id;

    const deleted = await NotificationToken.findOneAndDelete({
      userId,
      token
    });

    if (!deleted) {
      console.log("Device token not delete for account logout or uninstall in removedevicetoken funtion")
      return res.status(404).json({
        success: false,
        message: "Device token not found",
      });
    }

    console.log(`🗑️ Device token removed for user for logout: ${userId}`);

    res.status(200).json({
      success: true,
      message: "Device token removed successfully"
    });

  } catch (error) {
    console.error("Error removing device token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove device token"
    });
  }
};

// ✅ 3. GET USER'S DEVICES (perfect in Dashboard users ka devices dikhane k liye and define total devices kitni ha )
export const getUserDevices = async (req, res) => {
  try {
    const userId = req.user._id;

    const devices = await NotificationToken.find({ userId })
      .select('deviceType deviceName isActive lastActiveAt createdAt -_id')
      .sort({ lastActiveAt: -1 });

    const summary = {
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.isActive).length,
      devicesByType: {
        android: devices.filter(d => d.deviceType === 'android').length,
        ios: devices.filter(d => d.deviceType === 'ios').length,
        web: devices.filter(d => d.deviceType === 'web').length,
      }
    };

    res.status(200).json({
      success: true,
      ...summary,
      devices
    });

  } catch (error) {
    console.error("Error fetching user devices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch devices"
    });
  }
};

// ✅ 4. DEACTIVATE TOKEN (When FCM says token is invalid)
export const deactivateToken = async (token) => {
  return NotificationToken.deactivateToken(token)
};