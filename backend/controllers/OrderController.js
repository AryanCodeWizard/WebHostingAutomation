const Order = require("../models/Order");
const Invoice = require("../models/Invoice");

exports.createOrder = async (req, res) => {
  const { clientId, items, total } = req.body;

  // 1️⃣ Create Invoice first
  const invoice = await Invoice.create({
    clientId,
    lines: items.map(i => ({
      desc: i.config?.domain || "Product",
      amount: i.price || 0
    })),
    total,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  // 2️⃣ Create Order linked to invoice
  const order = await Order.create({
    clientId,
    items,
    invoiceId: invoice._id
  });

  res.json({ order, invoice });
};

exports.getOrders = async (req, res) => {
    const { clientId } = req.query;
    const orders = await Order.find({ clientId }).populate('invoiceId');
    res.json(orders);
    };

exports.getOrderById = async (req, res) => {
    const { orderId } = req.params;
    const order = await
    Order.findById(orderId).populate('invoiceId');

    if (!order) {
    return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
    };  
    
exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
    return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
    };

// export const deleteOrder = async(req,res) => {
//   const {orderId} = req,params;
//   const order = await order.findByIdAndDelete(orderId)
// ;}