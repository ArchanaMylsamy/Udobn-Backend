const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const createError = require('http-errors');
const cors = require("cors");

// Load environment variables early
dotenv.config();

// Import routes
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const razorpayRoutes = require("./routes/razorpayRoutes");
const emailRoutes = require("./routes/emailRoutes");

// Mongoose connection management
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    cachedConnection = connection;
    console.log("MongoDB connected successfully");
    return connection;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw new Error('Unable to connect to database');
  }
}

// Serverless function handler
module.exports = async (req, res) => {
  // Set response headers to prevent timeout
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Attempt to connect to database with a timeout
    await Promise.race([
      connectToDatabase(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 4000)
      )
    ]);

    // Create Express app
    const app = express();

    // Enable CORS
    app.use(
      cors({
        origin: [
          "http://localhost:3000", // Allow localhost for development
          "https://udobn.vercel.app", // Replace with your frontend domain
          "https://udobn-admin.vercel.app"
        ],
        credentials: true,
      })
    );

    // Lightweight middleware
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Log incoming requests
    app.use((req, res, next) => {
      console.log(`Incoming request: ${req.method} ${req.url}`);
      next();
    });

    // Health check route
    app.get('/api/health', (req, res) => {
      res.status(200).json({ 
        status: 'success', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    });

    // Route handlers
    app.use("/api/customers", customerRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/razorpay", razorpayRoutes);
    app.use("/api/email", emailRoutes);

    // 404 handler
    app.use((req, res, next) => {
      next(createError(404, 'Route not found'));
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error('Unhandled Error:', err);
      res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
      });
    });

    // Handle the request
    return new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) {
          console.error('Request processing error:', err);
          return res.status(500).json({
            status: 'error',
            message: 'Request processing failed'
          });
        }
        resolve();
      });
    });

  } catch (initError) {
    console.error('Initialization Error:', initError);
    return res.status(500).json({
      status: 'error',
      message: 'Server initialization failed',
      details: initError.message
    });
  }
};