const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new customer
exports.register = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new customer
    const customer = new Customer({
      name,
      email,
      password: hashedPassword,
      address,
      phone,
    });

    await customer.save();
    res.status(201).json({ message: "Customer registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Login customer
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "User not found! Kindly register..." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Set cookie
    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({ message: "Logged in successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get customer profile
exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id).select("-password");
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};