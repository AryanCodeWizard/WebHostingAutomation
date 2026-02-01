const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// All cart routes require authentication
router.use(auth);

// Cart routes
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update/:itemId", updateCartItem);
router.delete("/remove/:itemId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
