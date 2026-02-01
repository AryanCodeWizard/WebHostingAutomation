const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  getAllClients,
  getClientById,
//   createClient,
  updateClient,
  deleteClient,
} = require("../controllers/ClientController");
const { auth, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// All routes require authentication
// Admin can perform all operations
// Clients can only view their own data (implement in controller if needed)

// GET /api/clients/me - Get current user's client profile (Any authenticated user)
router.get("/me", auth, getMyProfile);

// PUT /api/clients/me - Update current user's client profile (Any authenticated user)
router.put("/me", auth, updateMyProfile);

// GET /api/clients - Get all clients (Admin only)
router.get("/", auth, isAdmin, getAllClients);

// POST /api/clients - Create a new client (Admin only)
// router.post("/", auth, isAdmin, createClient);

// GET /api/clients/:id - Get a single client by ID (Admin or own client)
router.get("/:id", auth, getClientById);

// PUT /api/clients/:id - Update a client (Admin or own client)
router.put("/:id", auth, updateClient);

// DELETE /api/clients/:id - Delete a client (Admin only)
router.delete("/:id", auth, isAdmin, deleteClient);

module.exports = router;
