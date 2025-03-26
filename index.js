const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Import routes
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const razorpayRoutes = require("./routes/razorpayRoutes");
const emailRoutes = require("./routes/emailRoutes");

// Serverless function handler
module.exports = async (req, res) => {
  // Ensure database connection
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log("MongoDB connected");
    }
  } catch (dbError) {
    console.error("MongoDB Connection Error:", dbError);
    return res.status(500).json({ 
      message: "Database Connection Failed", 
      error: dbError.message 
    });
  }

  // Create Express app
  const app = express();

  // CORS configuration
  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000', 
        'https://udobn.vercel.app'
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

  // Debug route
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

  // Routes
  app.use("/api/customers", customerRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/razorpay", razorpayRoutes);
  app.use("/api/email", emailRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });

  // Handle the request
  return new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) {
        console.error('Request handling error:', err);
        return reject(err);
      }
      resolve();
    });
  });
};