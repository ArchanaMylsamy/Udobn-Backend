const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      size: { type: String, required: true },
    },
  ],
  totalAmount: {
    inr: { type: Number, required: true },
    usd: { type: Number, required: true },
  },
  orderDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ["COD", "Online", "Card"], required: true },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  orderStatus: { 
    type: String, 
    enum: ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"], 
    default: "Pending" 
  },
  trackingNumber: { type: String },
  estimatedDeliveryDate: { type: Date },
  deliveredOn: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to update the updatedAt field
orderSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Order", orderSchema);