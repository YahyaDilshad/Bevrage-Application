import mongoose from "mongoose";
//react native pr jo hum order create krna pr 
const orderItemSchema = new mongoose.Schema({
  ProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: String,
  quantity: Number,
  price: Number,
  total: Number
});

const statusHistorySchema = new mongoose.Schema({
  status: String,
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["Cash Payment", 'Depit Card', 'Easypaisa' , 'Jazzcash'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['ORDER_CONFIRMED', 'ORDER_PREPARE', 'ORDER_PACKED', 'ORDER_ON_THE_WAY', 'ORDER_DELIVERED', 'ORDER_CANCELED'],
    default: 'pending',
    index: true
  },
  statusHistory: [statusHistorySchema],
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  estimatedDelivery: Date,
  deliveredAt: Date
}, {
  timestamps: true
});

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.models.Order.countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);