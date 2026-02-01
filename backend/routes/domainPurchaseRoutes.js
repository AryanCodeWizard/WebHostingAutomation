const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const DomainPurchaseService = require("../services/DomainPurchaseService");

/**
 * POST /api/domain-purchase/complete
 * Execute complete domain purchase flow in one call
 * (Useful for testing or automated purchases)
 */
router.post("/complete", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { domainName, period = 1 } = req.body;

    if (!domainName) {
      return res.status(400).json({
        success: false,
        message: "Domain name is required",
      });
    }

    const result = await DomainPurchaseService.executeCompletePurchaseFlow(
      userId,
      domainName,
      period
    );

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: "Domain purchase completed successfully",
        data: {
          orderId: result.order._id,
          invoiceId: result.invoice._id,
          domainId: result.domain._id,
          domainName: result.domain.name,
          expiryDate: result.domain.expiryDate,
        },
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Complete purchase error:", error);
    return res.status(500).json({
      success: false,
      message: "Purchase failed",
      error: error.message,
    });
  }
});

/**
 * GET /api/domain-purchase/summary
 * Get user's complete billing and domain summary
 */
router.get("/summary", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const summary = await DomainPurchaseService.getUserSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get summary",
      error: error.message,
    });
  }
});

/**
 * POST /api/domain-purchase/add-to-cart
 * Add domain to cart (Step 2 of flow)
 */
router.post("/add-to-cart", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { domainName, period = 1, price = 799 } = req.body;

    if (!domainName) {
      return res.status(400).json({
        success: false,
        message: "Domain name is required",
      });
    }

    const result = await DomainPurchaseService.addDomainToCart(
      userId,
      domainName,
      period,
      price
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Domain added to cart",
        cart: result.cart,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add to cart",
      error: error.message,
    });
  }
});

module.exports = router;
