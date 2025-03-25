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

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // You can specify allowed origins here
    const allowedOrigins = [
      'http://localhost:3000', 
      'https://your-frontend-domain.com'
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Debug route to check server status
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: "Server is running", 
    routes: [
      "/api/customers",
      "/api/products", 
      "/api/orders", 
      "/api/razorpay", 
      "/api/email"
    ]
  });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/razorpay", razorpayRoutes);
app.use("/api/email", emailRoutes);

// Comprehensive error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route Not Found", 
    path: req.path 
  });
});

