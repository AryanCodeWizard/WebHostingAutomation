const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { auth } = require("../middlewares/auth");

router.post("/create-order", auth, paymentController.createRazorpayOrder);
router.post("/verify-payment", paymentController.verifyPayment);
router.post("/verify-and-complete", auth, paymentController.verifyAndCompleteOrder);

module.exports = router;
