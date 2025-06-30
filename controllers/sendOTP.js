const { sendOTPEmail } = require("../utils/mailer.js"); // Import the email utility
const crypto = require("crypto"); // For generating a random OTP
const User = require("../models/users.js");
const validateEmail = require("../utils/emailValidator.js");

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    console.log("OTP requested for email:", email);

    // Check if user exists
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(200).json({ message: "If the email is registered, an OTP will be sent." });
    }

    // Generate OTP and expiry
    const otp = crypto.randomInt(100000, 999999);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Send the OTP via email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email. Please try again later." });
    }

    // Update user's OTP and expiry in the database
    const user = await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { new: true }
    );

    if (user) {
      return res.status(200).json({ message: "OTP sent successfully." });
    } else {
      return res.status(500).json({ message: "Failed to update user with OTP. Please try again later." });
    }
  } catch (error) {
    console.error("Error sending OTP:", error); // Log the error
    return res.status(500).json({ message: "An error occurred while processing your request." });
  }
};

module.exports = { sendOTP };
