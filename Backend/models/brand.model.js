import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    url: String,
    public_id: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",  // ✅ Correct reference name
    required: true,
  },
}, { timestamps: true });

// ✅ Make bra  nd name unique per category (not globally)
brandSchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.model("Brand", brandSchema);
