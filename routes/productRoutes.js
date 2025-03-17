const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Shop owner routes
router.post("/", authMiddleware.authenticate, productController.addProduct);
router.put("/:id", authMiddleware.authenticate, productController.updateProduct);
router.delete("/:id", authMiddleware.authenticate, productController.deleteProduct);

// Customer routes
router.get("/", productController.getAllProducts);
router.get("/category/:category", productController.getProductsByCategory);

module.exports = router;