import mongoose from "mongoose";

const serverSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["cpanel", "aws", "do"],
      required: true,
    },

    hostname: {
      type: String,
      required: true,
    },

    apiTokenEncrypted: {
      type: String,
      required: true,
    },

    capacity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Server", serverSchema);
