const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Customer routes
router.post("/", orderController.placeOrder);
router.get("/customer/:customerId", orderController.getOrdersByCustomer);

// Admin/Shop owner routes
router.get("/", orderController.getAllOrders);
router.get("/stats", orderController.getOrderStats);
router.put("/:id/status",  orderController.updateOrderStatus);
router.put("/:id/payment",  orderController.updatePaymentStatus);

// Get single order
router.get("/:id",orderController.getOrderById);
module.exports = router;