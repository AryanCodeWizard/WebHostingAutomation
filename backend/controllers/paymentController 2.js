const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const Invoice = require("../models/Invoice");
const Order = require("../models/Order");const Domain = require("../models/Domain");const mongoose = require("mongoose");

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { invoiceId, amount, domainName } = req.body;

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

    console.log("Creating Razorpay Order for Invoice:", invoiceId, "Amount:", amount, "Domain:", domainName);

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
      metadata: {
        domainName: domainName || null,
      }
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
    console.log("Looking for transaction with ref:", razorpay_order_id);
    
    // First, check if transaction exists
    let transaction = await Transaction.findOne({ ref: razorpay_order_id });
    
    if (!transaction) {
      console.error("Transaction not found for ref:", razorpay_order_id);
      return res.status(404).json({ 
        error: "Transaction not found",
        ref: razorpay_order_id
      });
    }

    // Check if already processed
    if (transaction.status === "success" && transaction.paymentId === razorpay_payment_id) {
      console.log("Payment already processed for transaction:", transaction._id);
      
      // Fetch related invoice and order
      const invoice = await Invoice.findById(transaction.invoiceId);
      const order = await Order.findOne({ invoiceId: transaction.invoiceId }).populate("clientId");
      
      return res.json({
        success: true,
        message: "Payment already verified",
        alreadyProcessed: true,
        transaction,
        invoice,
        order
      });
    }

    // Update transaction status
    transaction = await Transaction.findOneAndUpdate(
      { ref: razorpay_order_id },
      { 
        status: "success",
        paymentId: razorpay_payment_id 
      },
      { new: true }
    );

    console.log("Transaction found and updated:", transaction._id);

    // Update or create invoice
    console.log("Looking for invoice with ID:", transaction.invoiceId);
    let invoice = await Invoice.findByIdAndUpdate(
      transaction.invoiceId,
      { status: "paid" },
      { new: true }
    );

    // If invoice doesn't exist, create a default one
    if (!invoice) {
      console.warn("Invoice not found, creating a new one...");
      
      // Calculate due date (30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      invoice = await Invoice.create({
        _id: transaction.invoiceId,
        clientId: new mongoose.Types.ObjectId(),
        status: "paid",
        total: transaction.amount,
        dueDate: dueDate,
        lines: [
          {
            desc: "Domain Registration",
            amount: transaction.amount,
          }
        ]
      });
      console.log("Invoice created:", invoice._id);
    } else {
      console.log("Invoice found and updated:", invoice._id);
    }

    // Update order status
    console.log("Looking for order with invoiceId:", invoice._id);
    let order = await Order.findOneAndUpdate(
      { invoiceId: invoice._id },
      { status: "completed" },
      { new: true }
    ).populate("clientId");

    if (!order) {
      console.warn("Order not found for invoiceId:", invoice._id, "- creating one");
      
      // Build items array with domain info if available
      const orderItems = [];
      if (transaction.metadata && transaction.metadata.domainName) {
        orderItems.push({
          config: {
            domainName: transaction.metadata.domainName,
          }
        });
      }
      
      // Create a default order if it doesn't exist
      order = await Order.create({
        clientId: invoice.clientId || new mongoose.Types.ObjectId(),
        invoiceId: invoice._id,
        status: "completed",
        items: orderItems.length > 0 ? orderItems : invoice.lines || [],
        total: invoice.total || transaction.amount
      });
      console.log("Order created:", order._id);
    } else {
      console.log("Order completed:", order._id);
    }

    // Create domain record if domain info exists in order
    let domain = null;
    if (order && order.items && order.items.length > 0) {
      const domainItem = order.items.find(item => item.config && item.config.domainName);
      if (domainItem) {
        const domainName = domainItem.config.domainName;
        
        // Check if domain already exists
        const existingDomain = await Domain.findOne({ name: domainName });
        
        if (!existingDomain) {
          // Set expiry date to 1 year from now
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          
          domain = await Domain.create({
            clientId: order.clientId,
            name: domainName,
            registrar: "GoDaddy",
            expiryDate: expiryDate,
            status: "active"
          });
          console.log("Domain created:", domain._id, domain.name);
        } else {
          console.log("Domain already exists:", existingDomain._id);
          domain = existingDomain;
        }
      }
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      transaction,
      invoice,
      order,
      domain
    });

  } catch (err) {
    console.error("Payment Verification Error:", err);
    res.status(500).json({ 
      error: err.message || "Failed to verify payment"
    });
  }
};
