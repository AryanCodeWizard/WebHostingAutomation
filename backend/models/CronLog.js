import mongoose from "mongoose";

const cronLogSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },

    message: {
      type: String,
    },

    executionTime: {
      type: Number, // milliseconds
    },
  },
  { timestamps: true }
);

export default mongoose.model("CronLog", cronLogSchema);
