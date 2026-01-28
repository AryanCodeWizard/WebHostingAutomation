const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    template: {
      type: String,
    },

    status: {
      type: String,
      enum: ["sent", "failed"],
      required: true,
    },

    error: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailLog", emailLogSchema);
