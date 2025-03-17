const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: {
    inr: { type: Number, required: true },
    usd: { type: Number, required: true },
  },
  category: { type: String, required: true },
  gender: { type: String, required: true },
  sizes: { type: [String], required: true },
  images: { type: [String], required: true },
  stock: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);