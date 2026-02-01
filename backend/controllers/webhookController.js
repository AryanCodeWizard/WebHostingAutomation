const crypto = require("crypto"); 
const Invoice = require("../models/Invoice"); 
const Order = require("../models/Order"); 
const Transaction = require("../models/Transaction"); 
const godaddyAPI = require("../config/godaddy"); 

exports.razorpayWebhook = async (req, res) => {
  try {
    /* =====================================================
       1. VERIFY RAZORPAY WEBHOOK SIGNATURE
       ===================================================== */

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // TEMPORARY: Skip signature verification for local testing
    // TODO: Remove this in production!
    if (process.env.NODE_ENV !== 'production' && !secret) {
      console.warn('⚠️  WARNING: Webhook signature verification DISABLED for testing!');
    } else {
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");
    
      if (digest !== req.headers["x-razorpay-signature"]) {
        // Reject request if signature does not match
        return res.status(400).json({ message: "Invalid signature" });
      }
    }

    console.log('✅ Webhook received:', req.body.event);


    const event = req.body.event;
    // Example events: payment.captured, payment.failed


    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;
      // Extract payment object from webhook payload

      const razorpayOrderId = payment.order_id;
      // Razorpay order ID (used as reference in DB)

    
        //  4. UPDATE TRANSACTION STATUS
       
      const txn = await Transaction.findOneAndUpdate(
        { ref: razorpayOrderId },    
        { status: "success" },       
        { new: true }  
      );

      if (!txn) {
        return res.status(404).json({ message: "Transaction not found" });
      }

        //  5. MARK INVOICE AS PAID

      const invoice = await Invoice.findByIdAndUpdate(
        txn.invoiceId,               
        { status: "paid" },
        { new: true }

      );

      // 6. MARK ORDER AS COMPLETED

      const order = await Order.findOneAndUpdate(
        { invoiceId: invoice._id },   // Order linked to invoice
        { status: "completed" },      // Mark order completed
        { new: true }
      ).populate("clientId");
  
      if (!order) {
        console.error("Order not found for invoice:", invoice._id);
        return res.status(404).json({ message: "Order not found" });
      }

      const domainItem = order.items.find(
        item => item.config?.domain
      );
      // Look for an order item that includes a domain name

      if (domainItem) {
        const domainName = domainItem.config.domain;
        const period = domainItem.config.period || 1; // Default 1 year
        
        console.log("Attempting to purchase domain:", domainName, "for", period, "year(s)");
        
        try {
          // Call GoDaddy API to purchase domain
          const godaddyResponse = await godaddyAPI.post("/v1/domains/purchase", {
          consent: {
            agreedAt: new Date().toISOString(),
            agreedBy: "127.0.0.1",
            agreementKeys: ["DNRA"]
          },

          domain: domainName,
          period: period, // Use period from cart config
          privacy: true,

          // Admin contact details
          contactAdmin: {
            nameFirst: "SaaSify",
            nameLast: "SaaSify",
            email: "contact@saasify.com",
            phone: "1234567890",
            addressMailing: {
              address1: "Street 1",
              city: "Jalandhar",
              state: "Punjab",
              postalCode: "144411",
              country: "IN"
            }
          },

          contactRegistrant: {
            nameFirst: "SaaSify",
            nameLast: "SaaSify",
            email: "contact@saasify.com",
            phone: "1234567890",
            addressMailing: {
              address1: "Street 1",
              city: "Jalandhar",
              state: "Punjab",
              postalCode: "144411",
              country: "IN"
            }
          },

          contactTech: {
            nameFirst: "SaaSify",
            nameLast: "SaaSify",
            email: "contact@saasify.com",
            phone: "1234567890",
            addressMailing: {
              address1: "Street 1",
              city: "Jalandhar",
              state: "Punjab",
              postalCode: "144411",
              country: "IN"
            }
          },

          contactBilling: {
            nameFirst: "SaaSify",
            nameLast: "SaaSify",
            email: "contact@saasify.com",
            phone: "1234567890",
            addressMailing: {
              address1: "Street 1",
              city: "Jalandhar",
              state: "Punjab",
              postalCode: "144411",
              country: "IN"
            }
          }
        });
        
        console.log("✅ Domain purchased successfully from GoDaddy:", domainName);

        // 7️⃣ SAVE DOMAIN TO DATABASE (This was missing!)
        const Domain = require("../models/Domain");
        
        // Check if domain already exists (prevent duplicates)
        const existingDomain = await Domain.findOne({ name: domainName });
        
        if (!existingDomain) {
          // Calculate expiry date based on registration period
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + period);

          const savedDomain = await Domain.create({
            clientId: order.clientId,
            name: domainName,
            registrar: "godaddy",
            expiryDate: expiryDate,
            status: "active",
          });

          console.log("✅ Domain saved to database:", savedDomain._id, savedDomain.name);
        } else {
          console.log("⚠️  Domain already exists in database:", existingDomain._id);
        }

        } catch (domainError) {
          console.error("❌ Domain purchase failed:", domainError.response?.data || domainError.message);
          // Don't fail the whole webhook if domain purchase fails
          // You might want to send an email notification here
        }
      }
    }

    /* =====================================================
       9. ACKNOWLEDGE WEBHOOK
       ===================================================== */

    res.json({ status: "ok" });

  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    // Log error for debugging

    res.status(500).json({ message: "Webhook processing failed" });
  }
};
