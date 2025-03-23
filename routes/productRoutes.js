const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const Product = require("../models/Product");
const router = express.Router();

// Shop owner routes
router.post("/", productController.addProduct);

router.delete("/:id", productController.deleteProduct);

// Customer routes
router.get("/", productController.getAllProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/gender/:gender",productController.getProductsByGender);

// API to update a product in detail
router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, priceInr, priceUsd, category, gender, sizes, stock } = req.body;
      
      // Process the sizes if it's a string
      const sizesArray = typeof sizes === 'string' ? sizes.split(',') : sizes;
      
      const updateData = {
        name,
        description,
        price: { 
          inr: priceInr, 
          usd: priceUsd 
        },
        category,
        gender,
        sizes: sizesArray,
        stock
      };
      
      const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(200).json({ message: "Product updated successfully", product });
    } catch (err) {
      console.error("Error updating product:", err);
      res.status(500).json({ message: "Something went wrong" });
    }
  });
module.exports = router;