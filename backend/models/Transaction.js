import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
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

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
