const Cart = require("../models/Cart");
const Product = require("../models/Product");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../constants");

/**
 * Get user's shopping cart
 * @route GET /api/cart
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    let cart = await Cart.findOne({ userId }).populate("items.productId", "name price");

    // Auto-create cart if doesn't exist
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
      logger.info(`Created new cart for user: ${userId}`);
    }

    return sendSuccess(res, { cart }, "Cart retrieved successfully");
  } catch (error) {
    logger.error("Failed to fetch cart", error);
    return sendError(res, "Error fetching cart", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Add item to cart
 * @route POST /api/cart/add
 * @param {String} req.body.productId - Product ID
 * @param {Number} req.body.quantity - Quantity (default: 1)
 * @param {Object} req.body.config - Product configuration (e.g., domain details)
 */
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1, config } = req.body;

    // Validate required fields
    if (!productId) {
      return sendError(res, "Product ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Validate domain products require domain config
    if (product.type === "domain" && (!config || !config.domain)) {
      return sendError(
        res,
        "Domain name is required for domain products",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      logger.info(`Created new cart for user: ${userId}`);
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      if (config) {
        cart.items[existingItemIndex].config = config;
      }
      logger.info(`Updated cart item quantity for product: ${productId}`);
    } else {
      // Add new item
      cart.items.push({
        productId,
        name: product.name,
        price: product.pricing?.yearly || product.pricing?.monthly || 0,
        quantity,
        config,
      });
      logger.info(`Added new item to cart: ${product.name}`);
    }

    await cart.save();

    logger.success(`Cart updated - User: ${userId}, Items: ${cart.items.length}, Total: ₹${cart.total}`);

    return sendSuccess(res, { cart }, "Item added to cart successfully");
  } catch (error) {
    logger.error("Failed to add item to cart", error);
    return sendError(res, "Error adding item to cart", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Update cart item quantity
 * @route PUT /api/cart/update/:itemId
 * @param {String} req.params.itemId - Cart item ID
 * @param {Number} req.body.quantity - New quantity
 */
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return sendError(res, "Valid quantity is required", HTTP_STATUS.BAD_REQUEST);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return sendError(res, "Cart not found", HTTP_STATUS.NOT_FOUND);
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return sendError(res, "Item not found in cart", HTTP_STATUS.NOT_FOUND);
    }

    item.quantity = quantity;
    await cart.save();

    logger.info(`Updated cart item ${itemId} quantity to ${quantity}`);

    return sendSuccess(res, { cart }, "Cart item updated successfully");
  } catch (error) {
    logger.error("Failed to update cart item", error);
    return sendError(res, "Error updating cart item", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/remove/:itemId
 * @param {String} req.params.itemId - Cart item ID
 */
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return sendError(res, "Cart not found", HTTP_STATUS.NOT_FOUND);
    }

    const itemExists = cart.items.some(item => item._id.toString() === itemId);
    if (!itemExists) {
      return sendError(res, "Item not found in cart", HTTP_STATUS.NOT_FOUND);
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    logger.info(`Removed item ${itemId} from cart`);

    return sendSuccess(res, { cart }, "Item removed from cart successfully");
  } catch (error) {
    logger.error("Failed to remove item from cart", error);
    return sendError(res, "Error removing item from cart", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Clear all items from cart
 * @route DELETE /api/cart/clear
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return sendError(res, "Cart not found", HTTP_STATUS.NOT_FOUND);
    }

    const itemCount = cart.items.length;
    cart.items = [];
    await cart.save();

    logger.info(`Cleared ${itemCount} items from cart for user: ${userId}`);

    return sendSuccess(res, { cart }, "Cart cleared successfully");
  } catch (error) {
    logger.error("Failed to clear cart", error);
    return sendError(res, "Error clearing cart", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};
