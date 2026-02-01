const Client = require("../models/Client");
const User = require("../models/User");
const mongoose = require("mongoose");

// GET /api/clients/me - Get current user's client profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    let client = await Client.findOne({ userId })
      .populate("userId", "name email role createdAt")
      .lean();

    // Auto-create if doesn't exist
    if (!client) {
      client = await Client.create({ userId });
      client = await Client.findById(client._id)
        .populate("userId", "name email role createdAt")
        .lean();
    }

    res.status(200).json({
      success: true,
      message: "Client profile retrieved successfully",
      data: client,
    });
  } catch (error) {
    console.error("Error fetching client profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching client profile",
      error: error.message,
    });
  }
};

// PUT /api/clients/me - Update current user's client profile
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { company, address, gst } = req.body;

    let client = await Client.findOne({ userId });

    // Auto-create if doesn't exist
    if (!client) {
      client = await Client.create({ userId });
    }

    // Build update object (only include provided fields)
    const updateData = {};
    if (company !== undefined) updateData.company = company;
    if (address !== undefined) updateData.address = address;
    if (gst !== undefined) updateData.gst = gst;

    // Update client
    const updatedClient = await Client.findByIdAndUpdate(
      client._id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("userId", "name email role createdAt")
      .lean();

    res.status(200).json({
      success: true,
      message: "Client profile updated successfully",
      data: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating client profile",
      error: error.message,
    });
  }
};

// GET /api/clients - Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({})
        .populate("userId", "email role createdAt updatedAt")
    res.status(200).json({
        success: true,
        message: "Clients retrieved successfully",
        data: clients,
        });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching clients",
      error: error.message,
    });
  }
};

// GET /api/clients/:id - Get a single client by ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID format",
      });
    }

    const client = await Client.findById(id)
      .populate("userId", "email role createdAt updatedAt")
      .lean();

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client retrieved successfully",
      data: client,
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching client",
      error: error.message,
    });
  }
};

//TODO  POST /api/clients - Create a new client


// PUT /api/clients/:id - Update a client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, address, gst, walletBalance } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID format",
      });
    }

    // Check if client exists
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Build update object (only include provided fields)
    const updateData = {};
    if (company !== undefined) updateData.company = company;
    if (address !== undefined) updateData.address = address;
    if (gst !== undefined) updateData.gst = gst;
    if (walletBalance !== undefined) {
      if (typeof walletBalance !== "number" || walletBalance < 0) {
        return res.status(400).json({
          success: false,
          message: "Wallet balance must be a non-negative number",
        });
      }
      updateData.walletBalance = walletBalance;
    }

    // Update client
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("userId", "email role")
      .lean();

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({
      success: false,
      message: "Error updating client",
      error: error.message,
    });
  }
};

// DELETE /api/clients/:id - Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID format",
      });
    }

    // Check if client exists
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Delete the client
    await Client.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
      data: {
        deletedClientId: id,
      },
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting client",
      error: error.message,
    });
  }
};
