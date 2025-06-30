const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema(
    {
        profileImage: {
            type: String,
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            minlength: [3, 'First name must be at least 3 characters'],
        },
        lastName: {
            type: String,
            trim: true,
            minlength: [3, 'First name must be at least 3 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true, // Ensures email uniqueness
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Ensures password is not returned in queries by default
            validate: {
                validator: function (value) {
                    // If the user is not using Google OAuth, password must be provided
                    if (!this.isNew && !this.isModified('password')) {
                        return true;
                    }
                    return value || this.fromGoogle;
                },
                message: 'Password is required unless signing up via Google OAuth',
            },
        },
        fromGoogle: {
            type: Boolean,
            default: false, // True if the user is created via Google OAuth
        },

        role: {
            type: String,
            enum: [null, 'farmer', 'buyer', 'transporter', 'admin'], // Valid roles + null
            default: null
        },
        address: { type: String, default: null },
        city: { type: String, default: null },
        province: { type: String, default: null },
        country: { type: String, default: null },

        isLoggin: {
            type: Boolean,
            default: false
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        profileComplete: {
            type: Boolean,
            default: false
        },
        otp: { type: Number },  // Add OTP field
        otpExpiry: { type: Date }, // Optional: Add OTP expiration
        farmerDetails: {
            type: {
                farmName: String,
                farmLocation: String,
                description: String,
                farmerPhoneNumber: String,
            },
            default: null, // Important: Ensure default value is null or an empty object if not a farmer
        },
        transporterDetails: {
            type: {
                transporterAddress: String,
                transporterPhoneNumber: String,
            },
            default: null,
        },
        buyerDetails: {
            type: {
                buyerAddress: String,

            },
            default: null,
        },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt timestamps
);

// Pre-save hook to hash the password before saving to the database
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.methods.comparePassword = async function (inputPassword) {
    return bcrypt.compare(inputPassword, this.password);
};

UserSchema.methods.generateToken = async function () {
    try {
        const user = this;
        return jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.PRIVATE_SECRET_KEY,
            {
                expiresIn: "10d",
            }
        )

    } catch (error) {
        console.log("error in jsonwebtoken", error)
    }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
