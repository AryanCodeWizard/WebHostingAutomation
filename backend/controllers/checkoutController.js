const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const User = require("../models/User");

/**
 * Checkout: Convert Cart to Order + Invoice
 * This must be called BEFORE payment
 */
exports.checkout = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Get user's cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // 2. Get or create client profile
    let client = await Client.findOne({ userId });
    if (!client) {
      // Auto-create client profile if not exists
      client = await Client.create({
        userId,
        walletBalance: 0,
      });
      console.log("Created new client profile:", client._id);
    }

    // 3. Calculate total from cart
    const total = cart.total;
    const subtotal = cart.subtotal;
    const tax = cart.tax;

    // 4. Create Invoice
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

    const invoiceLines = cart.items.map((item) => ({
      desc: item.name,
      amount: item.price * item.quantity,
    }));

    const invoice = await Invoice.create({
      clientId: client._id,
      lines: invoiceLines,
      total,
      status: "unpaid",
      dueDate,
    });

    console.log("Invoice created:", invoice._id);

    // 5. Create Order (linked to invoice)
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      qty: item.quantity,
      config: item.config || {}, // This should contain { domain: "example.com", period: 1 }
    }));

    const order = await Order.create({
      clientId: client._id,
      items: orderItems,
      status: "pending",
      invoiceId: invoice._id,
    });

    console.log("Order created:", order._id);

    // 6. Clear cart after checkout
    cart.items = [];
    await cart.save();

    // 7. Return invoice and order details
    return res.status(201).json({
      success: true,
      message: "Checkout successful",
      data: {
        invoice: {
          id: invoice._id,
          total: invoice.total,
          status: invoice.status,
          dueDate: invoice.dueDate,
        },
        order: {
          id: order._id,
          status: order.status,
          items: order.items,
        },
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Checkout failed",
      error: error.message,
    });
  }
};

/**
 * Get checkout summary (without creating order)
 * Useful for showing preview before confirming checkout
 */
exports.getCheckoutSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        itemCount: cart.items.length,
      },
    });
  } catch (error) {
    console.error("Get checkout summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get checkout summary",
      error: error.message,
    });
  }
};
