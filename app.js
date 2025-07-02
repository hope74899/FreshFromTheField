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

app.use("/public", express.static(path.join(__dirname, "public"))); //for local 
// app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// CORS setup for Production and Development
const corsOptions = {
    origin: process.env.FRONTENDPATH,
    methods: "GET, POST, PATCH, PUT, DELETE, HEAD",
    credentials: true
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

app.use(router);
app.get('/text', (req, res) => {
    res.send('app is running')
})
app.use((req, res, next) => {
    console.log('Middleware initialized');
    next();
});
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});
app.use(errorMiddleware);
const port = process.env.PORT || 8000;
connection().then(() => {
    app.listen(port, () => {
        console.log(`app is running on port ${port}`)
    })
}
).catch((error) => {
    console.log('Failed to connect to MongoDB', error);
})