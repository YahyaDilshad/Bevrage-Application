// models/Notification.model.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    // User Reference (Required - aapke code mein userId hai)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Notification Content (aapke templates ke according)
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    // Notification Type (aapke code ke hisaab se)
    notificationType: {
        type: String,
        enum: [
            'ORDER_CONFIRMED',
            'ORDER_PREPARE', 
            'ORDER_PACKED',
            'ORDER_ON_THE_WAY',
            'ORDER_DELIVERED',
            'ORDER_CANCELED',
            'NEW_ORDER_ADMIN',
            'TEST',
            'GENERAL',
            'PROMOTION',
            'BULK_NOTIFICATION'
        ],
        required: true,
        index: true
    },

    // Order Reference (aapke order notifications ke liye)
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    orderNumber: {
        type: String,
        trim: true
    },

    // Data Payload (aapke firebase notifications ke liye)
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        /*
        Example structure:
        {
            type: "general",
            timestamp: "2024-01-01T10:00:00Z",
            orderId: "12345",
            notificationType: "ORDER_CONFIRMED",
            test: "1",
            role: "admin"
        }
        */
    },

    // Delivery Status (aapke process ke hisaab se)
    status: {
        type: String,
        enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ'],
        default: 'PENDING',
        index: true
    },

    // Read Status (user ne read kiya ya nahi)
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },

    // Device/Target Info (aapke token system ke liye)
    deviceType: {
        type: String,
        enum: ['android', 'ios', 'web'],
        default: 'multiple'
    },
    targetTokens: [{
        type: String,
        trim: true
        // FCM tokens jisko bheja gaya
    }],
    role: {
        type: String,
        enum: ['user', 'admin', 'all'],
        default: 'user'
    },

    // Priority (aapke business logic ke liye)
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    // Schedule & Expiry
    scheduledAt: {
        type: Date,
        default: Date.now
    },
    sentAt: {
        type: Date
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ orderId: 1, notificationType: 1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ isAdminNotification: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });


// ✅ Pre-save Middleware
notificationSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    
    // Auto-set deviceType based on targetTokens
    if (this.targetTokens && this.targetTokens.length > 0) {
        if (this.targetTokens.length === 1) {
            const token = this.targetTokens[0];
            if (token.includes('android') || token.length > 100) {
                this.deviceType = 'android';
            } else if (token.includes('ios') || token.includes('APNS')) {
                this.deviceType = 'ios';
            } else {
                this.deviceType = 'web';
            }
        } else {
            this.deviceType = 'multiple';
        }
    }
    
    next();
});

export default mongoose.model('Notification', notificationSchema);
