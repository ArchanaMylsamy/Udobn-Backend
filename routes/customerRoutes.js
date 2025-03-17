const express = require("express");
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", customerController.register);
router.post("/login", customerController.login);

// Protected routes
router.get("/profile", authMiddleware.authenticate, customerController.getProfile);

module.exports = router;