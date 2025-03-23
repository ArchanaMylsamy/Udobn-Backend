const Order = require("../models/Order");

const Product = require("../models/Product"); // Import Product model

exports.placeOrder = async (req, res) => {
  try {
    const { 
      customerId, 
      products, 
      totalAmountInr, 
      totalAmountUsd,
      paymentMethod,
      paymentStatus,
      deliveryAddress
    } = req.body;

    let totalINR = 0;
    let exchangeRate = 83.5; // Assume 1 USD = 83.5 INR (Replace with real-time conversion if needed)

    // If totalAmount is not provided, calculate from product prices
    if (!totalAmountInr || !totalAmountUsd) {
      for (const item of products) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product not found: ${item.productId}` });
        }
        totalINR += product.price * item.quantity; // Fetch price from database
      }
    }

    const totalAmount = {
      inr: totalAmountInr || totalINR, 
      usd: totalAmountUsd || (totalINR / exchangeRate).toFixed(2)
    };

    const order = new Order({
      customerId,
      products,
      totalAmount,
      paymentMethod,
      paymentStatus,
      deliveryAddress
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Get orders by customer
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customerId })
      .populate("products.productId")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber, estimatedDeliveryDate, notes } = req.body;

    const updateData = { orderStatus };
    
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate) updateData.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    if (notes) updateData.notes = notes;
    if (orderStatus === "Delivered") updateData.deliveredOn = new Date();

    const order = await Order.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      id, 
      { paymentStatus }, 
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Payment status updated successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Get all orders with optional filters
exports.getAllOrders = async (req, res) => {
  try {
    const { status, paymentMethod, fromDate, toDate } = req.query;
    
    let query = {};
    
    if (status) query.orderStatus = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    if (fromDate && toDate) {
      query.orderDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }

    const orders = await Order.find(query)
      .populate("customerId", "name email phone")
      .populate("products.productId")
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const pendingCount = await Order.countDocuments({ orderStatus: "Pending" });
    const processingCount = await Order.countDocuments({ orderStatus: "Processing" });
    const shippedCount = await Order.countDocuments({ orderStatus: "Shipped" });
    const outForDeliveryCount = await Order.countDocuments({ orderStatus: "Out for Delivery" });
    const deliveredCount = await Order.countDocuments({ orderStatus: "Delivered" });
    const cancelledCount = await Order.countDocuments({ orderStatus: "Cancelled" });
    
    const codCount = await Order.countDocuments({ paymentMethod: "COD" });
    const onlineCount = await Order.countDocuments({ paymentMethod: "Online" });
    const cardCount = await Order.countDocuments({ paymentMethod: "Card" });
    
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalInr: { $sum: "$totalAmount.inr" },
          totalUsd: { $sum: "$totalAmount.usd" }
        }
      }
    ]);

    res.status(200).json({
      orderCounts: {
        total: totalOrders,
        pending: pendingCount,
        processing: processingCount,
        shipped: shippedCount,
        outForDelivery: outForDeliveryCount,
        delivered: deliveredCount,
        cancelled: cancelledCount
      },
      paymentMethods: {
        cod: codCount,
        online: onlineCount,
        card: cardCount
      },
      revenue: totalRevenue.length > 0 ? totalRevenue[0] : { totalInr: 0, totalUsd: 0 }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate("customerId", "name email phone")
      .populate("products.productId");
      
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};