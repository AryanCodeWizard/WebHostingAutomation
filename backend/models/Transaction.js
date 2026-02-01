const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      index: true,
    },

    invoiceNumber: {
      type: String,
      index: true,
    },

    gateway: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    ref: {
      type: String,
    },

    paymentId: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
