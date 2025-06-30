const User = require('../models/users')
const crypto = require('crypto');
const { sendOTPEmail } = require('../utils/mailer');
const { log } = require('console');


const createUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exist...' })
        }
        // Generate random OTP (6 digits)
        const otp = crypto.randomInt(100000, 999999);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

        // Create user with OTP
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            otp,
            otpExpiry
        });

        // Send OTP via email
        await sendOTPEmail(email, otp);

        if (user) {
            return res.status(201).json({
                message: "User created successfully. Please check your email for the OTP.",
                userId: user._id ? user._id.toString() : null
            });
        }
    }
    catch (err) {
        console.log('Signup error:', err);
        next(err)
    }
}
const getUser = async (req, res, next) => {
    try {
        const users = await User.find();
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json(users);
    }
    catch (err) {
        console.log('Error while getting user:', err);
        next(err)
    }
}
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requesterRole = req?.user?.role;

        const {
            firstName,
            lastName,
            email,
            role,
            address,
            city,
            province,
            country,
            farmName,
            farmLocation,
            description,
            farmerPhoneNumber,
            transporterPhoneNumber,
        } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle profile image upload
        const imageDetail = req.files?.profileImage?.[0];
        const fileName = imageDetail ? imageDetail.filename : null;
        if (fileName) user.profileImage = fileName;

        // Update basic fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (address) user.address = address;
        if (city) user.city = city;
        if (province) user.province = province;
        if (country) user.country = country;

        // Conditionally update role (only if allowed)
        if (role && (user.role === null || user.profileComplete === false)) {
            user.role = role;
            user.profileComplete = true;

            if (role === 'farmer') {
                user.farmerDetails = {
                    farmName: farmName || user.farmerDetails?.farmName,
                    farmLocation: farmLocation || user.farmerDetails?.farmLocation,
                    description: description || user.farmerDetails?.description,
                    farmerPhoneNumber: farmerPhoneNumber || user.farmerDetails?.farmerPhoneNumber,
                };
                user.transporterDetails = null;
                user.buyerDetails = null;
            } else if (role === 'transporter') {
                user.transporterDetails = {
                    transporterPhoneNumber: transporterPhoneNumber || user.transporterDetails?.transporterPhoneNumber,
                };
                user.farmerDetails = null;
                user.buyerDetails = null;
            } else if (role === 'buyer') {
                user.buyerDetails = {};
                user.farmerDetails = null;
                user.transporterDetails = null;
            } else if (role === 'admin') {
                user.farmerDetails = null;
                user.transporterDetails = null;
                user.buyerDetails = null;
            }
        }

        // Save and respond
        const updatedUser = await user.save();
        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (err) {
        console.log('Error while updating user:', err);
        next(err);
    }
};

const updateUserByAdmin = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role, isLoggin, isVerified, profileComplete } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'user id not found' });
        }

        // Fields to update, we'll only add them if they are present in the request
        const fieldsToUpdate = {};

        if (role !== undefined) {
            // Let Mongoose schema validation handle enum check during update
            fieldsToUpdate.role = role;
        }
        if (isLoggin !== undefined) {
            if (typeof isLoggin !== 'boolean') {
                return res.status(400).json({ message: 'isLoggin must be a boolean.' });
            }
            fieldsToUpdate.isLoggin = isLoggin;
        }
        if (isVerified !== undefined) {
            if (typeof isVerified !== 'boolean') {
                return res.status(400).json({ message: 'isVerified must be a boolean.' });
            }
            fieldsToUpdate.isVerified = isVerified;
        }
        if (profileComplete !== undefined) {
            if (typeof profileComplete !== 'boolean') {
                return res.status(400).json({ message: 'profileComplete must be a boolean.' });
            }
            fieldsToUpdate.profileComplete = profileComplete;
        }

        // Check if there's anything to update
        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({
                message: 'No valid fields provided for update. Please provide role, isLoggin, isVerified, or profileComplete.',
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true, context: 'query' } // runValidators is crucial for enum
        ).select('email role isLoggin isVerified profileComplete');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found or no changes made.' });
        }

        res.status(200).json({
            message: 'User status updated successfully by admin.',
            user: updatedUser,
        });

    }
    catch (error) {
        console.log('Error while updating user:', error);
        next(error)
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find and delete the user
        const deletedUser = await User.findByIdAndDelete(id);

        // If the user is not found
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            user: deletedUser, // Optionally return the deleted user details
        });
    } catch (err) {
        console.log('Error while deleting user:', err);
        next(err)
    }
};
const currentUser = async (req, res, next) => {
    try {
        // Ensure `req.user` exists
        if (!req.user) {
            return res.status(400).json({
                status: "error",
                message: "Token verification failed"
            });
        }
        const data = req.user;
        // Fetch user from database
        const user = await User.findById(data._id);
        // console.log(user)
        // Handle case when user is not found
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }
        // Respond with user data
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.error("Error while token verification:", err);
        next(err); // Pass the error to the next middleware for centralized error handling
    }
};
const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(200).json({ message: "user id is missing" })
        }
        const user = await User.findById(userId);
        // console.log(user)
        // Handle case when user is not found
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }
        // Respond with user data
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.error("Error while token verification:", err);
        next(err); // Pass the error to the next middleware for centralized error handling
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email.' });
        }
        // Verify password (if using bcrypt for hashing)
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid password.' });
        }
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Account Verification Required...Your account is not verified. Please verify your account to proceed."
            });
        }
        const isLoggin = true;
        const updatedUser = await User.findOneAndUpdate({ email }, { isLoggin }, { new: true });
        const token = await user.generateToken()
        // Generate a JWT token for the user
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: "strict",
            path: "/", // Match this
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 day expiration
        });
        return res.status(200).json({
            message: 'Login successfully',
            user: updatedUser,
            token: token,
            tokenExpiry: Date.now() + 10 * 24 * 60 * 60 * 1000 // Send expiry in milliseconds
        });
    }
    catch (err) {
        console.log('Error while loging user:', err);
        next(err)
    }
};
const logout = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(400).json({ message: "User not authenticated" });
        }

        const userId = req.user._id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user's isLoggedIn field to false
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isLoggedin: false }, // Corrected field name
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).json({ message: "Failed to log out user." });
        }

        // Clear the token cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Must match login config
            sameSite: "strict",
            path: "/", // Must match login config
        });

        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ message: "Failed to log out user." });
            }

            // Clear the `connect.sid` cookie
            res.clearCookie("connect.sid", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Match session config
                sameSite: "strict", // Match session config
                path: "/", // Match session config
            });

            return res.status(200).json({ message: "logged out successfully" });
        });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        console.log(email, otp);


        // Find the user by email
        const user = await User.findOne({ email });
        console.log(user);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if OTP matches and is still valid
        if (user.otp != otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // If you set OTP expiry, validate if it's expired
        if (user.otpExpiry && user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // OTP is valid, so you can now verify the user (e.g., mark as verified)
        user.otp = null; // Clear OTP
        user.otpExpiry = null; // Clear OTP expiry if used
        user.isVerified = true;
        await user.save();

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        next(error);
    }
};
const searchEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const emailExist = await User.findOne({ email }).select({ password: 0 });
        if (!emailExist) {
            res.status(400);
            const error = new Error("Email not found");
            throw error;
        }
        const otp = crypto.randomInt(10000, 99999);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        const user = await User.findOneAndUpdate(
            { email },
            { otp, otpExpiry },
            { new: true }
        );
        await sendOTPEmail(email, otp);
        return res.status(201).json({ message: 'Enter OTP sent to your email' });
    } catch (error) {
        next(error);
    }
};
const updatePassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        // Check if the user exists by email
        const userExist = await User.findOne({ email: email });
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }
        // Update the user's password
        userExist.password = password;
        await userExist.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};
const googleCallback = async (req, res) => {
    try {
        const user = req.user; // Passport attaches the authenticated user to req.user

        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Generate a JWT token using a User model method
        const token = await user.generateToken();
        // Store the token as an HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            path: "/",
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
        });

        // Redirect to frontend route after setting the cookie
        const frontendRedirectURL = `${process.env.frontendPath}/google-login`;
        return res.redirect(frontendRedirectURL); // Adjust the URL based on your frontend domain
    } catch (error) {
        console.error("Error in Google OAuth callback:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const getToken = (req, res) => {
    try {
        // console.log("Request Headers:", req.headers);
        // Ensure req.cookies exists
        if (!req.cookies) {
            return res.status(400).json({ message: "Cookies are not available" });
        }
        const token = req.cookies.token; // Access the token from cookies

        if (!token) {
            return res.status(401).json({ message: "Token not found" });
        }

        return res.status(200).json({ token });
    } catch (error) {
        console.error("Error in getToken controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { createUser, getUser, getUserById, updateUser, updateUserByAdmin, deleteUser, currentUser, login, logout, verifyOTP, searchEmail, updatePassword, googleCallback, getToken };
