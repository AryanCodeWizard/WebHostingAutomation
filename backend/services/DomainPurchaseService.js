const Cart = require("../models/Cart");
const Client = require("../models/Client");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Transaction = require("../models/Transaction");
const Domain = require("../models/Domain");

/**
 * 🎯 COMPLETE DOMAIN PURCHASE FLOW SERVICE
 * Orchestrates the entire flow from user to domain ownership
 */

class DomainPurchaseService {
  /**
   * 1️⃣ Get or create client profile
   */
  static async ensureClientProfile(userId) {
    let client = await Client.findOne({ userId });
    
    if (!client) {
      client = await Client.create({
        userId,
        walletBalance: 0,
      });
      console.log("✅ Client profile created:", client._id);
    }
    
    return client;
  }

  /**
   * 2️⃣ Add domain product to cart
   */
  static async addDomainToCart(userId, domainName, period = 1, price = 799) {
    // Get or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Find domain product (assuming you have one in DB)
    let domainProduct = await Product.findOne({ type: "domain" });
    
    if (!domainProduct) {
      // Create default domain product if doesn't exist
      domainProduct = await Product.create({
        name: "Domain Registration",
        type: "domain",
        pricing: {
          yearly: price,
        },
      });
      console.log("✅ Domain product created:", domainProduct._id);
    }

    // Check if domain already in cart
    const existingItem = cart.items.find(
      (item) => item.config?.domain === domainName
    );

    if (existingItem) {
      return {
        success: false,
        message: "Domain already in cart",
      };
    }

    // Add domain to cart
    cart.items.push({
      productId: domainProduct._id,
      name: `Domain - ${domainName}`,
      price: domainProduct.pricing.yearly,
      quantity: 1,
      config: {
        domain: domainName,
        period: period,
      },
    });

    await cart.save();
    console.log("✅ Domain added to cart:", domainName);

    return {
      success: true,
      cart,
    };
  }

  /**
   * 3️⃣ Checkout: Cart → Order + Invoice
   */
  static async checkout(userId) {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Cart is empty",
      };
    }

    // Ensure client profile exists
    const client = await this.ensureClientProfile(userId);

    // Create Invoice
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceLines = cart.items.map((item) => ({
      desc: item.name,
      amount: item.price * item.quantity,
    }));

    const invoice = await Invoice.create({
      clientId: client._id,
      lines: invoiceLines,
      total: cart.total,
      status: "unpaid",
      dueDate,
    });

    console.log("✅ Invoice created:", invoice._id);

    // Create Order
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      qty: item.quantity,
      config: item.config,
    }));

    const order = await Order.create({
      clientId: client._id,
      items: orderItems,
      status: "pending",
      invoiceId: invoice._id,
    });

    console.log("✅ Order created:", order._id);

    // Clear cart
    cart.items = [];
    await cart.save();

    return {
      success: true,
      invoice,
      order,
    };
  }

  /**
   * 4️⃣ Process payment (simulated - normally done by Razorpay webhook)
   */
  static async processPayment(invoiceId, razorpayOrderId, razorpayPaymentId) {
    // Create/update transaction
    const transaction = await Transaction.create({
      invoiceId,
      gateway: "razorpay",
      amount: 0, // Will be updated
      ref: razorpayOrderId,
      paymentId: razorpayPaymentId,
      status: "success",
    });

    console.log("✅ Transaction created:", transaction._id);

    // Update invoice
    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status: "paid" },
      { new: true }
    );

    console.log("✅ Invoice marked as paid:", invoice._id);

    // Update order
    const order = await Order.findOneAndUpdate(
      { invoiceId: invoice._id },
      { status: "completed" },
      { new: true }
    ).populate("clientId");

    console.log("✅ Order marked as completed:", order._id);

    return {
      transaction,
      invoice,
      order,
    };
  }

  /**
   * 5️⃣ Purchase domain from GoDaddy and save to DB
   */
  static async purchaseDomain(orderId) {
    const order = await Order.findById(orderId).populate("clientId");
    
    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    // Find domain item in order
    const domainItem = order.items.find((item) => item.config?.domain);
    
    if (!domainItem) {
      return {
        success: false,
        message: "No domain found in order",
      };
    }

    const domainName = domainItem.config.domain;
    const period = domainItem.config.period || 1;

    // Check if domain already exists
    const existingDomain = await Domain.findOne({ name: domainName });
    
    if (existingDomain) {
      return {
        success: false,
        message: "Domain already purchased",
        domain: existingDomain,
      };
    }

    // In real implementation, call GoDaddy API here
    // const godaddyResponse = await godaddyAPI.post('/v1/domains/purchase', {...});
    console.log("📞 Calling GoDaddy API to purchase:", domainName);

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + period);

    // Save domain to database
    const domain = await Domain.create({
      clientId: order.clientId._id,
      name: domainName,
      registrar: "godaddy",
      expiryDate,
      status: "active",
    });

    console.log("✅ Domain saved to database:", domain._id, domain.name);

    return {
      success: true,
      domain,
    };
  }

  /**
   * 🎯 COMPLETE FLOW: Execute all steps
   */
  static async executeCompletePurchaseFlow(userId, domainName, period = 1) {
    try {
      console.log("\n🚀 Starting complete domain purchase flow...\n");

      // Step 1: Ensure client exists
      console.log("1️⃣ Checking client profile...");
      const client = await this.ensureClientProfile(userId);

      // Step 2: Add domain to cart
      console.log("\n2️⃣ Adding domain to cart...");
      const cartResult = await this.addDomainToCart(userId, domainName, period);
      if (!cartResult.success) {
        return cartResult;
      }

      // Step 3: Checkout
      console.log("\n3️⃣ Processing checkout...");
      const checkoutResult = await this.checkout(userId);
      if (!checkoutResult.success) {
        return checkoutResult;
      }

      // Step 4: Process payment (simulated)
      console.log("\n4️⃣ Processing payment...");
      const paymentResult = await this.processPayment(
        checkoutResult.invoice._id,
        "rzp_test_order_123",
        "rzp_test_payment_456"
      );

      // Step 5: Purchase domain
      console.log("\n5️⃣ Purchasing domain from GoDaddy...");
      const domainResult = await this.purchaseDomain(paymentResult.order._id);

      console.log("\n✅ Complete flow executed successfully!\n");

      return {
        success: true,
        client,
        cart: cartResult.cart,
        invoice: checkoutResult.invoice,
        order: checkoutResult.order,
        transaction: paymentResult.transaction,
        domain: domainResult.domain,
      };
    } catch (error) {
      console.error("❌ Flow execution failed:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 📊 Get user's complete billing summary
   */
  static async getUserSummary(userId) {
    const client = await Client.findOne({ userId }).populate("userId");
    const cart = await Cart.findOne({ userId });
    const orders = await Order.find({ clientId: client._id })
      .populate("invoiceId")
      .sort({ createdAt: -1 });
    const domains = await Domain.find({ clientId: client._id });
    const invoices = await Invoice.find({ clientId: client._id }).sort({ createdAt: -1 });

    return {
      user: client?.userId,
      client,
      cart,
      orders,
      domains,
      invoices,
      stats: {
        totalOrders: orders.length,
        completedOrders: orders.filter((o) => o.status === "completed").length,
        totalDomains: domains.length,
        activeDomains: domains.filter((d) => d.status === "active").length,
        pendingPayments: invoices.filter((i) => i.status === "unpaid").length,
      },
    };
  }
}

module.exports = DomainPurchaseService;
