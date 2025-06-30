const validator = require("validator");

const validateEmail = (email) => {
    if (!email || !validator.isEmail(email)) {
        return false; // Invalid email
    }
    return true; // Valid email
};

module.exports = validateEmail;
