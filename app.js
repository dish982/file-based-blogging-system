const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const connectDB = require('./config/db.js');

// Initialize the core Express instance
const app = express();
const PORT = 3000;

// Load environment variables and spin up your cloud database
dotenv.config();
connectDB();

//Set view engine to EJS //Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Serve static files (css, images)
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: true,            
    saveUninitialized: true, 
    cookie: { 
        secure: false,        
        maxAge: 24 * 60 * 60 * 1000 
    }
}));
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.error = null;
    res.locals.success = null;
    next();
});
 


//Routes
const authRoutes = require('./routes/auth'); 
const blogRoutes = require('./routes/blog');

app.use('/auth', authRoutes); 
app.use('/', blogRoutes);

//Start the server 
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}/`);
});