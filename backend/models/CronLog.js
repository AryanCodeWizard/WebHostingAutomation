const mongoose = require("mongoose");

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

module.exports = mongoose.model("CronLog", cronLogSchema);
