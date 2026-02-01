const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        config: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],

    subtotal: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Method to calculate totals
cartSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  this.tax = this.subtotal * 0.18; // 18% GST
  this.total = this.subtotal + this.tax;
};

// Pre-save middleware to auto-calculate totals
cartSchema.pre("save", async function () {
  this.calculateTotals();
});

module.exports = mongoose.model("Cart", cartSchema);
