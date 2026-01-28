const mongoose = require("mongoose");

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

module.exports = mongoose.model("Product", productSchema);
