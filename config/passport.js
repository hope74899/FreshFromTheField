const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/users'); // Adjust path based on your setup

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:8000/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find existing user
                // console.log(profile)
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Update login state for existing user
                    user.isLoggin = true;
                    await user.save();
                } else {
                    // Create new user
                    user = await User.create({
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile.emails[0].value,
                        avatar: profile.photos[0]?.value, // Optional: Profile picture
                        isVerified: true, // Google users are inherently verified
                        isLoggin: true,
                        fromGoogle: true,
                    });
                }

                return done(null, user);
            } catch (err) {
                console.error("Error in Google OAuth strategy:", err);
                return done(err, null);
            }
        }
    )
);

// Serialize user to session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return done(new Error("User not found during deserialization"), null);
        }
        done(null, user);
    } catch (err) {
        console.error("Error in deserializing user:", err);
        done(err, null);
    }
});

module.exports = passport;
