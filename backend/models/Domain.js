const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    registrar: {
      type: String,
    },

    expiryDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "expired", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Domain", domainSchema);