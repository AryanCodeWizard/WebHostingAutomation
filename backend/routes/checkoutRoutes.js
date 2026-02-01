const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { checkout, getCheckoutSummary } = require("../controllers/checkoutController");

// All checkout routes require authentication
router.use(auth);

// POST /api/checkout - Convert cart to order + invoice
router.post("/", checkout);

// GET /api/checkout/summary - Get checkout preview
router.get("/summary", getCheckoutSummary);

module.exports = router;
