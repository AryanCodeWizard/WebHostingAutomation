const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const Domain = require("../models/Domain");
const Client = require("../models/Client");
const Cart = require("../models/Cart");
const godaddyAPI = require("../config/godaddy");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");
const { HTTP_STATUS, TRANSACTION_STATUS, INVOICE_STATUS, ORDER_STATUS, TAX_CONFIG } = require("../constants");

/**
 * Create Razorpay payment order
 * @route POST /api/payments/create-order
 * @param {Number} req.body.amount - Order amount in INR
 * @param {Array} req.body.items - Cart items
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, items } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, "Valid amount is required", HTTP_STATUS.BAD_REQUEST);
    }

    logger.info(`Creating Razorpay order for amount: ₹${amount}`);

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        itemCount: items?.length || 0
      }
    });

    // Save transaction with pending status
    await Transaction.create({
      gateway: "razorpay",
      amount: amount,
      ref: order.id,
      status: TRANSACTION_STATUS.PENDING,
      metadata: {
        items: items || []
      }
    });

    logger.success(`Razorpay order created: ${order.id}`);

    return sendSuccess(res, order, "Payment order created successfully");
  } catch (error) {
    logger.error("Failed to create Razorpay order", error);
    return sendError(res, "Error creating payment order", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Verify payment signature and complete order
 * Industry-standard flow: Payment → Order → Invoice → Domain Registration
 * @route POST /api/payments/verify-and-complete
 * @param {String} req.body.razorpay_order_id - Razorpay order ID
 * @param {String} req.body.razorpay_payment_id - Razorpay payment ID
 * @param {String} req.body.razorpay_signature - Payment signature
 * @param {Array} req.body.items - Order items
 * @param {Object} req.body.billingDetails - Customer billing details
 */
exports.verifyAndCompleteOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, billingDetails } = req.body;
    const userId = req.user.userId;

    logger.info('Payment verification request received:', {
      razorpay_order_id,
      razorpay_payment_id,
      hasSignature: !!razorpay_signature,
      itemsCount: items?.length || 0,
      hasBillingDetails: !!billingDetails,
      userId
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      logger.warn('Payment details incomplete');
      return sendError(res, "Payment details are incomplete", HTTP_STATUS.BAD_REQUEST);
    }

    if (!items || items.length === 0) {
      logger.warn('Order items missing or empty');
      return sendError(res, "Order items are required", HTTP_STATUS.BAD_REQUEST);
    }

    logger.info(`Verifying payment for order: ${razorpay_order_id}`);

    // 1. Verify Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      logger.warn(`Invalid payment signature for order: ${razorpay_order_id}`);
      return sendError(res, "Invalid payment signature", HTTP_STATUS.BAD_REQUEST);
    }

    logger.success(`Payment signature verified: ${razorpay_order_id}`);

    // 2. Update transaction status
    const txn = await Transaction.findOneAndUpdate(
      { ref: razorpay_order_id },
      { status: TRANSACTION_STATUS.SUCCESS, paymentId: razorpay_payment_id },
      { new: true }
    );

    if (!txn) {
      logger.error(`Transaction not found for order: ${razorpay_order_id}`);
      return sendError(res, "Transaction not found", HTTP_STATUS.NOT_FOUND);
    }

    // 3. Get or create client profile
    let client = await Client.findOne({ userId });
    if (!client) {
      client = await Client.create({
        userId,
        walletBalance: 0,
        company: billingDetails?.company,
        address: billingDetails?.address,
        gst: billingDetails?.gst,
      });
      logger.info(`Created new client profile for user: ${userId}`);
    }

    // 4. Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * TAX_CONFIG.GST_RATE;
    const total = subtotal + tax;

    // 5. Create Invoice (status: paid, since payment is already verified)
    const invoiceLines = items.map(item => ({
      desc: `${item.name}${item.config?.domain ? ` - ${item.config.domain}` : ''}`,
      amount: item.price * item.qty,
    }));

    const invoice = await Invoice.create({
      clientId: client._id,
      lines: invoiceLines,
      total,
      status: INVOICE_STATUS.PAID,
      dueDate: new Date(),
    });

    logger.success(`Invoice created: ${invoice._id}`);

    // 6. Create Order
    const orderItems = items.map(item => ({
      productId: item.productId,
      qty: item.qty,
      config: item.config || {},
    }));

    const order = await Order.create({
      clientId: client._id,
      items: orderItems,
      status: ORDER_STATUS.PENDING,
      invoiceId: invoice._id,
    });

    logger.success(`Order created: ${order._id}`);

    // 7. Link transaction to invoice
    await Transaction.findByIdAndUpdate(txn._id, {
      invoiceId: invoice._id,
    });

    // 8. Clear cart
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }
    );

    logger.info("Cart cleared after successful payment");

    // 9. Queue domain registration asynchronously (non-blocking)
    setImmediate(async () => {
      await processDomainRegistration(items, billingDetails, order._id, client._id);
    });

    // 10. Return success response immediately
    const responseData = {
      order: {
        id: order._id,
        status: order.status,
      },
      invoice: {
        id: invoice._id,
        total: invoice.total,
      },
      transaction: {
        id: txn._id,
        paymentId: razorpay_payment_id,
      }
    };

    logger.success(`Payment completed successfully for order: ${order._id}`);

    return sendSuccess(res, responseData, "Payment verified and order created successfully");
  } catch (error) {
    logger.error("Payment completion failed", error);
    return sendError(res, "Error completing payment", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Process domain registration in background
 * @private
 * @param {Array} items - Order items
 * @param {Object} billingDetails - Customer billing details
 * @param {String} orderId - Order ID
 * @param {String} clientId - Client ID
 */
async function processDomainRegistration(items, billingDetails, orderId, clientId) {
  try {
    for (const item of items) {
      if (!item.config?.domain) continue;

      const domainName = item.config.domain;
      const period = item.config.period || 1;

      logger.info(`Processing domain registration: ${domainName}`);

      // Check if domain already exists
      const existing = await Domain.findOne({ name: domainName });
      if (existing) {
        logger.warn(`Domain already exists in database: ${domainName}`);
        continue;
      }

      // Attempt GoDaddy API registration
      try {
        const [firstName, ...lastNameParts] = (billingDetails?.name || "User Name").split(' ');
        const lastName = lastNameParts.join(' ') || "User";

        await godaddyAPI.post("/v1/domains/purchase", {
          consent: {
            agreedAt: new Date().toISOString(),
            agreedBy: "127.0.0.1",
            agreementKeys: ["DNRA"]
          },
          domain: domainName,
          period: period,
          contactAdmin: buildContactInfo(firstName, lastName, billingDetails, "admin"),
          contactBilling: buildContactInfo(firstName, lastName, billingDetails, "billing"),
          contactRegistrant: buildContactInfo(firstName, lastName, billingDetails, "registrant"),
          contactTech: buildContactInfo(firstName, lastName, billingDetails, "tech"),
        });

              console.log("✅ Domain purchased:", domainName);


        logger.success(`Domain registered with GoDaddy: ${domainName}`);

        // Save domain to database
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + period);

        await Domain.create({
          clientId,
          name: domainName,
          registrar: "godaddy",
          status: "active",
          registeredAt: new Date(),
          expiresAt: expiryDate,
          autoRenew: false
        });

        logger.success(`Domain saved to database: ${domainName}`);

        // Update order status to completed
        await Order.findByIdAndUpdate(orderId, {
          status: ORDER_STATUS.COMPLETED
        });

        logger.success(`Order marked as completed: ${orderId}`);

      } catch (apiError) {
        logger.error(`GoDaddy API error for ${domainName}`, apiError);
        // Note: Domain registration failed but payment succeeded
        // This should trigger a manual review or support ticket
      }
    }
  } catch (error) {
    logger.error("Background domain registration failed", error);
  }
}

/**
 * Helper function to build contact information for GoDaddy API
 * @private
 */
function buildContactInfo(firstName, lastName, billingDetails, type) {
  return {
    nameFirst: firstName,
    nameLast: lastName,
    email: billingDetails?.email || `${type}@example.com`,
    phone: "+1.1234567890",
    addressMailing: {
      address1: billingDetails?.address || "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "US"
    }
  };
}

/**
 * Legacy payment verification endpoint (kept for backward compatibility)
 * @deprecated Use verifyAndCompleteOrder instead
 * @route POST /api/payments/verify-payment
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    logger.warn("Using deprecated verifyPayment endpoint");

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return sendError(res, "Invalid payment signature", HTTP_STATUS.BAD_REQUEST);
    }

    // Update transaction status
    const txn = await Transaction.findOneAndUpdate(
      { ref: razorpay_order_id },
      { status: TRANSACTION_STATUS.SUCCESS, paymentId: razorpay_payment_id },
      { new: true }
    );

    if (!txn) {
      return sendError(res, "Transaction not found", HTTP_STATUS.NOT_FOUND);
    }

    // Update invoice and order if they exist
    if (txn.invoiceId) {
      await Invoice.findByIdAndUpdate(txn.invoiceId, { status: INVOICE_STATUS.PAID });
      
      const order = await Order.findOne({ invoiceId: txn.invoiceId });
      if (order) {
        await Order.findByIdAndUpdate(order._id, { status: ORDER_STATUS.COMPLETED });
      }
    }

    return sendSuccess(res, { transaction: txn }, "Payment verified successfully");
  } catch (error) {
    logger.error("Payment verification failed", error);
    return sendError(res, "Error verifying payment", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};
