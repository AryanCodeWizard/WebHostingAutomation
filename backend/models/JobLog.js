const mongoose = require("mongoose");

const jobLogSchema = new mongoose.Schema(
  {
    jobType: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
    },

    error: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobLog", jobLogSchema);


