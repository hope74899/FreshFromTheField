require('dotenv').config();
const express = require('express');
const path = require('path');
const connection = require('./config/database');
const cors = require('cors');
const router = require('./routes/router');
const errorMiddleware = require('./middleware/errorHandlerMiddleware');
const session = require("express-session");
const passport = require("./config/passport");
const cookieParser = require('cookie-parser');

const app = express();
const _dirname = path.resolve();

// --- 1. CORE MIDDLEWARE ---

// CORS setup for Production and Development
const corsOptions = {
    methods: "GET, POST, PATCH, PUT, DELETE, HEAD",
    credentials: true
};

if (process.env.NODE_ENV === 'production') {
    // In production, your server and client are on the same origin
    // but being explicit with an env var is robust for the future.
    corsOptions.origin = process.env.frontendPath || 'https://your-app-name.onrender.com'; // Change this!
} else {
    // For local development
    corsOptions.origin = "http://localhost:5173";
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.PRIVATE_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // This is correct
        sameSite: process.env.NODE_ENV === "production" ? "None" : "lax", // 'None' is safer for OAuth, 'lax' is good for dev
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    }
}));

// Passport a-authentication
app.use(passport.initialize());
app.use(passport.session());

// Static assets from your /public folder (e.g., images for API use)
// Placing this here is fine.
app.use("/public", express.static(path.join(_dirname, "public")));

// --- 2. API ROUTES ---
// All your backend API routes MUST be registered here, before the frontend serving.
app.use(router);

app.get('/text', (req, res) => { // This route will now work
    res.send('The /text route is running correctly!');
});

// --- 3. SERVE REACT FRONTEND ---
// This section must come AFTER all API routes.

// Serve the static files from the React app's 'dist' folder
app.use(express.static(path.join(_dirname, '/client/dist')));

// For any other GET request that hasn't been handled, serve index.html.
// This is the key for React Router to handle client-side routing.
app.get('*', (_, res) => {
    res.sendFile(path.join(_dirname, "client", "dist", "index.html"));
});

// --- 4. ERROR HANDLING MIDDLEWARE ---
// These must be the VERY LAST middleware to be registered.

app.use((req, res, next) => {
    // This now correctly catches requests to routes that truly don't exist
    res.status(404).json({ message: 'API Route Not Found' });
});

// Your custom global error handler
app.use(errorMiddleware);

// --- 5. SERVER STARTUP ---
const port = process.env.PORT || 8000;
connection().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((error) => {
    console.log('Failed to connect to MongoDB', error);
<<<<<<< HEAD
});
=======
});
>>>>>>> 636cdbeba1df9f6076dbb22bc8041b6c86493aee
