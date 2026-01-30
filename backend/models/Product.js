import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["hosting", "vps", "saas", "domain"],
      required: true,
    },

    pricing: {
      monthly: Number,
      yearly: Number,
    },

    configOptions: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
