const Order = require("../models/Order");

// Place an order
exports.placeOrder = async (req, res) => {
  try {
    const { customerId, products, totalAmountInr, totalAmountUsd } = req.body;

    const order = new Order({
      customerId,
      products,
      totalAmount: { inr: totalAmountInr, usd: totalAmountUsd },
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get orders by customer
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customerId }).populate("products.productId");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};