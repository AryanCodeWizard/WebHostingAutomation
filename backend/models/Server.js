const mongoose = require("mongoose");

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

module.exports = mongoose.model("Server", serverSchema);
