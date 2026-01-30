import mongoose from "mongoose";

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

export default mongoose.model("Domain", domainSchema);