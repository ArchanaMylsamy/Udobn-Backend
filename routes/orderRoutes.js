const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Customer routes
router.post("/", authMiddleware.authenticate, orderController.placeOrder);
router.get("/:customerId", authMiddleware.authenticate, orderController.getOrdersByCustomer);

// Shop owner routes
router.put("/:id/status", authMiddleware.authenticate, orderController.updateOrderStatus);

module.exports = router;