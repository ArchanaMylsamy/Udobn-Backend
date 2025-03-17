const Product = require("../models/Product");
const upload = require("../middleware/uploadMiddleware");

// Add a new product
exports.addProduct = [
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { name, description, priceInr, priceUsd, category, gender, sizes, stock } = req.body;
      const images = req.files.map((file) => file.path);

      const product = new Product({
        name,
        description,
        price: { inr: priceInr, usd: priceUsd },
        category,
        gender,
        sizes: JSON.parse(sizes),
        images,
        stock,
      });

      await product.save();
      res.status(201).json({ message: "Product added successfully", product });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  },
];

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};