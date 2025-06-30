const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes window
    max: 5, // Limit each IP to 5 requests per window
    message: {
        message: "Too many OTP requests. Please try again after 10 minutes.",
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = otpLimiter;
