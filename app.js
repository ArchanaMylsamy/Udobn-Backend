const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Import routes
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const razorpayRoutes = require("./routes/razorpayRoutes");
const emailRoutes = require("./routes/emailRoutes");

// Initialize app
const app = express();

// CORS configuration to allow all origins with credentials
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);  // Allow all origins
  },
  credentials: true,  // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow specific headers
};

app.use(cors(corsOptions));  // Enable CORS with options

// Middleware
app.use(express.json());       // Built-in JSON parser in Express
app.use(cookieParser());       // Parse cookies
app.use("/uploads", express.static("uploads"));

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/razorpay", razorpayRoutes);
app.use("/api/email", emailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);  // Log stack trace for debugging
  res.status(500).json({ message: "Something went wrong!" });  // Generic error message
});

module.exports = app;
