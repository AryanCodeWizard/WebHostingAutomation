import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        qty: {
          type: Number,
          default: 1,
        },
        config: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
