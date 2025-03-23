const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/send-email", async (req, res) => {
    const { name, email, message } = req.body;
  
    const transporter = nodemailer.createTransport({
      service: "gmail", // Change this if using another email provider
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or App Password
      },
    });
  
    const mailOptions = {
      from: email, // Sender (user's email)
      to: process.env.OWNER_EMAIL, // Owner's email (admin)
      subject: `New Contact Form Submission from Udobn`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  });


router.post("/send-design", async (req, res) => {
    const { email, message, designs } = req.body;

    if (!email || !designs.length) {
        return res.status(400).json({ error: "Email and at least one design image are required." });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const attachments = designs.map((design) => ({
            filename: `tshirt-${design.side}.png`,
            content: design.image.split(";base64,").pop(),
            encoding: "base64",
        }));

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: "Custom T-Shirt Design Submission from Udobn",
            text: `Here are the additional details from the user :\n\nEmail: ${email}\n\nMessage: ${message}`,
            attachments,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Design email sent successfully!" });

    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email. Please try again later." });
    }
});

module.exports = router;
  