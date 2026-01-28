import Product from "../models/Product.js";
import mongoose from "mongoose";

// GET /api/products - Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });

   
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// GET /api/products/:id - Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// POST /api/products - Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, type, pricing, configOptions } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Name and type are required fields",
      });
    }

    // Validate product type
    const validTypes = ["hosting", "vps", "saas", "domain"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Validate pricing if provided
    if (pricing) {
      if (pricing.monthly && (typeof pricing.monthly !== "number" || pricing.monthly < 0)) {
        return res.status(400).json({
          success: false,
          message: "Monthly pricing must be a non-negative number",
        });
      }
      if (pricing.yearly && (typeof pricing.yearly !== "number" || pricing.yearly < 0)) {
        return res.status(400).json({
          success: false,
          message: "Yearly pricing must be a non-negative number",
        });
      }
    }

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this name already exists",
      });
    }

    // Create new product
    const newProduct = await Product.create({
      name,
      type,
      pricing: pricing || {},
      configOptions: configOptions || {},
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// PUT /api/products/:id - Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, pricing, configOptions } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Build update object
    const updateData = {};

    if (name !== undefined) {
      // Check if name is being changed to an existing product name
      if (name !== product.name) {
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
          return res.status(409).json({
            success: false,
            message: "Product with this name already exists",
          });
        }
      }
      updateData.name = name;
    }

    if (type !== undefined) {
      const validTypes = ["hosting", "vps", "saas", "domain"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product type. Must be one of: ${validTypes.join(", ")}`,
        });
      }
      updateData.type = type;
    }

    if (pricing !== undefined) {
      if (pricing.monthly !== undefined) {
        if (typeof pricing.monthly !== "number" || pricing.monthly < 0) {
          return res.status(400).json({
            success: false,
            message: "Monthly pricing must be a non-negative number",
          });
        }
      }
      if (pricing.yearly !== undefined) {
        if (typeof pricing.yearly !== "number" || pricing.yearly < 0) {
          return res.status(400).json({
            success: false,
            message: "Yearly pricing must be a non-negative number",
          });
        }
      }
      updateData.pricing = { ...product.pricing, ...pricing };
    }

    if (configOptions !== undefined) {
      updateData.configOptions = configOptions;
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// DELETE /api/products/:id - Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: {
        deletedProductId: id,
      },
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};