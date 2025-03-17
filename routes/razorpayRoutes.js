const express = require("express");
const router = express.Router();
const Razorpay = require('razorpay');

// Initialize Razorpay with your key credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, 
    key_secret: process.env.RAZORPAY_KEY_SECRET 
});

// Create order endpoint
router.post('/create-order', async (req, res) => {
    try {
      const { amount, receipt, notes } = req.body;
      const options = {
        amount: Math.round(amount * 100), // amount in paise 
        currency: "INR",
        receipt: receipt,
        notes: notes
      };
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: error.message });
    }
});
  
// Verify payment endpoint
router.post('/verify-payment', (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;
      const crypto = require('crypto');
      const text = razorpay_order_id + "|" + razorpay_payment_id;
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest("hex");
      if (generated_signature === razorpay_signature) {
        console.log("Payment verified successfully");
        console.log("Order details:", orderDetails);
        res.json({ 
          success: true,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id 
        });
      } else {
        console.log("Payment verification failed");
        res.status(400).json({ success: false });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: error.message });
    }
});

module.exports = router;
  