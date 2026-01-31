const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const mongoose = require("mongoose");

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { invoiceId, amount } = req.body;

    // Validate input
    if (!invoiceId || !amount) {
      return res.status(400).json({ 
        error: "Invoice ID and amount are required" 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        error: "Amount must be greater than 0" 
      });
    }

    // Razorpay has a maximum amount limit per transaction
    // INR: Max 15,00,000 (15 lakhs) per transaction
    if (amount > 1500000) {
      return res.status(400).json({ 
        error: "Amount exceeds maximum transaction limit of ₹15,00,000" 
      });
    }

    console.log("Creating Razorpay Order for Invoice:", invoiceId, "Amount:", amount);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `invoice_${invoiceId}`,
    });
    
    console.log("Razorpay Order Created:", order);

    // Convert invoiceId to ObjectId if it's a valid ObjectId string
    // Otherwise, use it as is (for testing purposes)
    let invoiceObjectId;
    if (mongoose.Types.ObjectId.isValid(invoiceId)) {
      invoiceObjectId = new mongoose.Types.ObjectId(invoiceId);
    } else {
      // For testing with non-ObjectId strings, create a new ObjectId
      // In production, you should create a real invoice first
      invoiceObjectId = new mongoose.Types.ObjectId();
      console.log("Warning: Using generated ObjectId instead of provided invoiceId");
    }

    // Save transaction (pending)
    const transaction = await Transaction.create({
      invoiceId: invoiceObjectId,
      gateway: "razorpay",
      amount,
      ref: order.id,
      status: "pending",
    });

    console.log("Transaction Created:", transaction);

    res.json(order);
  } catch (err) {
    console.error("Payment Controller Error:", err);
    res.status(500).json({ 
      error: err.message || "Failed to create order"
    });
  }
};

// Verify payment after successful Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        error: "Missing required payment details" 
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ 
        error: "Invalid payment signature" 
      });
    }

    console.log("Payment verified successfully:", razorpay_payment_id);

    // Update transaction status
    const transaction = await Transaction.findOneAndUpdate(
      { ref: razorpay_order_id },
      { 
        status: "success",
        paymentId: razorpay_payment_id 
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ 
        error: "Transaction not found" 
      });
    }

    // Update invoice status
    const invoice = await Invoice.findByIdAndUpdate(
      transaction.invoiceId,
      { status: "paid" },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ 
        error: "Invoice not found" 
      });
    }

    // Update order status
    const order = await Order.findOneAndUpdate(
      { invoiceId: invoice._id },
      { status: "completed" },
      { new: true }
    ).populate("clientId");

    console.log("Order completed:", order?._id);

    res.json({
      success: true,
      message: "Payment verified successfully",
      transaction,
      invoice,
      order
    });

  } catch (err) {
    console.error("Payment Verification Error:", err);
    res.status(500).json({ 
      error: err.message || "Failed to verify payment"
    });
  }
};
