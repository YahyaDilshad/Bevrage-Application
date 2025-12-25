import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    // Product name (e.g., Pepsi 500ml, Milkpak 1L)
    name: {
      type: String,
      required: true,
      trim: true
    },

    // Optional image URL or path
    image: {
      type: String,
      default: ""
    },

    
  },
  {
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("Banners", BannerSchema);
