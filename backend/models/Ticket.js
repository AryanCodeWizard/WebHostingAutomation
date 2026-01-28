const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "answered", "closed"],
      default: "open",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

const ticketReplySchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
    },

    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = {
  Ticket: mongoose.model("Ticket", ticketSchema),
  TicketReply: mongoose.model("TicketReply", ticketReplySchema),
};
