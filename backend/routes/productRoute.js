const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductController");
const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// GET /api/products - Get all products (Public or authenticated)
router.get("/", getAllProducts);

// GET /api/products/:id - Get a single product by ID (Public or authenticated)
router.get("/:id", getProductById);

// POST /api/products - Create a new product (Admin only)
router.post("/", auth, isAdmin, createProduct);

// PUT /api/products/:id - Update a product (Admin only)
router.put("/:id", auth, isAdmin, updateProduct);

// DELETE /api/products/:id - Delete a product (Admin only)
router.delete("/:id", auth, isAdmin, deleteProduct);

module.exports = router;