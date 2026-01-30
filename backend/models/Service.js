import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended", "terminated"],
      default: "pending",
      index: true,
    },

    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
    },

    credentialsEncrypted: {
      type: String,
    },

    nextDueDate: {
      type: Date,
      index: true,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ status: 1, nextDueDate: 1 });

export default mongoose.model("Service", serviceSchema);
