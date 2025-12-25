import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Product name (e.g., Pepsi 500ml, Milkpak 1L)
    name: {
      type: String,
      required: true,
      trim: true
    },

    // Price of the product
    price: {
      type: Number,
      required: true,
      min: 0
    },

    // Optional image URL or path
    image: {
      type: String,
      default: ""
    },

    // Reference to Brand collection
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true
    },

    // Reference to Category collection
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    // Current available stock
    stock: {
      type: Number,
      default: 0
    },

    // Optional discount field for offers
    discount: {
      type: Number,
      default: 0
    },
    description : {
     type : String
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("Product", productSchema);
