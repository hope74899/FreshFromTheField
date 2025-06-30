const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  timeout: 10000, // 10 seconds
  logger: false, // Enable logger in non-production
  debug: process.env.NODE_ENV !== 'production',  // Enable debugging in non-production
});

// Function to send OTP email
const sendOTPEmail = async (recipientEmail, otp) => {
  const mailOptions = {
    from: `FreshFromTheField <${process.env.EMAIL_USER || 'noreply@freshfromthefield.com'}>`,
    to: recipientEmail,
    subject: "Your OTP for FreshFromTheField Account Verification",
    text: `Your OTP code is ${otp}`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="background-color: #f0fdf4; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #2e7d32; text-align: center;">Verify Your Email</h2>
                    <p style="color: #333; font-size: 16px; text-align: center;">
                        Dear User,<br/>
                        Thank you for joining <strong>FreshFromTheField</strong>! Please use the following One-Time Password (OTP) to verify your email and activate your account:
                    </p>
                    <div style="text-align: center; margin: 20px 0;">
                        <code style="font-size: 22px; font-weight: bold; color: #fff; background-color: #388e3c; padding: 10px 20px; border-radius: 4px;">
                            ${otp}
                        </code>
                    </div>
                    <p style="color: #555; font-size: 14px; text-align: center;">
                        This OTP is valid for 10 minutes. If you didn’t request this email, you can safely ignore it.
                    </p>
                    <p style="text-align: center; font-size: 14px; color: #777;">
                        Need help? Contact us at <a href="mailto:support@freshfromthefield.com" style="color: #388e3c;">support@freshfromthefield.com</a>
                    </p>
                </div>
                <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
                    © 2024 FreshFromTheField. All rights reserved.
                </div>
            </div>
        `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message, error.response);
    throw new Error('Failed to send OTP email.');
  }
};

const sendContactEmail = async ({ firstName, lastName, email, phone, message }) => {
  const mailOptions = {
    from: `FreshFromTheField <${process.env.EMAIL_USER || 'noreply@freshfromthefield.com'}>`,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Submission from ${firstName} ${lastName}`,
    text: `
      Name: ${firstName} ${lastName}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      Message: ${message}
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="background-color: #f0fdf4; padding: 30px; border-radius: 8px;">
          <h2 style="color: #2e7d32; text-align: center;">New Contact Message</h2>
          <p style="color: #333; font-size: 16px; text-align: center;">
            Dear Support Team,<br/>
            You have received a new message from <strong>FreshFromTheField</strong> contact form:
          </p>
          <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 4px;">
            <p style="color: #333; font-size: 14px; margin: 5px 0;">
              <strong>Name:</strong> ${firstName} ${lastName}
            </p>
            <p style="color: #333; font-size: 14px; margin: 5px 0;">
              <strong>Email:</strong> ${email}
            </p>
            <p style="color: #333; font-size: 14px; margin: 5px 0;">
              <strong>Phone:</strong> ${phone || 'Not provided'}
            </p>
            <p style="color: #333; font-size: 14px; margin: 5px 0;">
              <strong>Message:</strong><br/>${message}
            </p>
          </div>
          <p style="color: #555; font-size: 14px; text-align: center;">
            Please respond to this inquiry at your earliest convenience.
          </p>
          <p style="text-align: center; font-size: 14px; color: #777;">
            Need help? Contact us at <a href="mailto:support@freshfromthefield.com" style="color: #388e3c;">support@freshfromthefield.com</a>
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
          © 2024 FreshFromTheField. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent: ', info.response);
    return info;
  } catch (error) {
    console.error('Error sending contact email:', error.message, error.response);
    throw new Error('Failed to send contact email.');
  }
};

const sendOrderConfirmationToBuyer = async (recipientEmail, orderId) => {
  const mailOptions = {
    from: `FreshFromTheField <${process.env.EMAIL_USER || 'noreply@freshfromthefield.com'}>`,
    to: recipientEmail,
    subject: "Your FreshFromTheField Order Has Been Placed!",
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
              <h2 style="color: #2e7d32; text-align: center;">Order Successfully Placed</h2>
              <p style="text-align: center;">Thank you for your order!</p>
              <p style="text-align: center;">Your order <strong>#${orderId}</strong> has been placed successfully. You’ll be notified when the farmer accepts your order.</p>
              <p style="text-align: center; color: #777;">For help, contact us at <a href="mailto:support@freshfromthefield.com">support@freshfromthefield.com</a></p>
          </div>
      `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending buyer email:", error.message);
    throw new Error("Failed to send order confirmation to buyer.");
  }
};

const sendOrderNotificationToFarmer = async (farmerEmail, buyerName, orderItems, orderId) => {
  const itemList = orderItems.map(item =>
    `<li><strong>${item.name}</strong> - ${item.quantity} ${item.unit} @ ₹${item.price}/unit</li>`
  ).join("");

  const mailOptions = {
    from: `FreshFromTheField <${process.env.EMAIL_USER || 'noreply@freshfromthefield.com'}>`,
    to: farmerEmail,
    subject: "New Order Received on FreshFromTheField",
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
              <h2 style="color: #2e7d32; text-align: center;">You Have a New Order</h2>
              <p>Buyer <strong>${buyerName}</strong> has placed a new order (#${orderId}).</p>
              <p>Order Summary:</p>
              <ul>${itemList}</ul>
              <p>Please check your dashboard to accept or reject this order.</p>
              <p style="color: #777;">Need help? Contact <a href="mailto:support@freshfromthefield.com">support@freshfromthefield.com</a></p>
          </div>
      `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending farmer email:", error.message);
    throw new Error("Failed to notify farmer about the order.");
  }
};


module.exports = { sendOTPEmail, sendContactEmail, sendOrderConfirmationToBuyer, sendOrderNotificationToFarmer };