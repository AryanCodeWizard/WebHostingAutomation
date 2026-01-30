import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    company: {
      type: String,
    },

    address: {
      type: String,
    },

    gst: {
      type: String,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
