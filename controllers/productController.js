const Product = require("../models/Product");
const upload = require("../middleware/uploadMiddleware");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();
// Add a new product
exports.addProduct = [
  upload.array("images", 5),
  async (req, res) => {
    try {
      console.log("Request body:", req.body);
      console.log("Uploaded files:", req.files);
      
      const { name, description, priceInr, priceUsd, category, gender, sizes, stock } = req.body;
      
      // Split sizes string into an array and trim each value
      const sizesArray = sizes.split(",").map(size => size.trim());
      
      const product = new Product({
        name,
        description,
        price: { inr: priceInr, usd: priceUsd },
        category,
        gender,
        sizes: sizesArray,
        // Store the Cloudinary URLs instead of local paths
        images: req.files.map((file) => file.path),
        stock,
      });
      
      await product.save();
      res.status(201).json({ message: "Product added successfully", product });
    } catch (err) {
      console.error("Error adding product:", err);
      res.status(500).json({ message: "Something went wrong" });
    }
  },
];

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json({ product });
  } catch (err) {
    console.error("Error fetching product by id:", err);
    
    // Handle invalid ID format
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    
    res.status(500).json({ message: "Something went wrong" });
  }
};

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

//Get latest Products
exports.getLatestProducts = async (req, res) => {
  try {
    const latestProducts = await Product.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(5); // Get only the latest 5

    res.json(latestProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch latest products" });
  }
};

//Get all products by gender
exports.getProductsByGender = async (req, res) => {
  try {
    const { gender } = req.params;
    const products = await Product.find({ gender: gender });
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for this gender" });
    }
    res.status(200).json({ products });
  } catch (err) {
    console.error("Error fetching products by gender:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const gender = req.query.gender; // Optional: Add gender as a query parameter

    const query = { category: category };
    if (gender) {
      query.gender = gender;
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};