// routes/auth.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('auth', { error: null, success: null });
});

// SIGNUP LOGIC
router.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;
    
    try {
        
        if (!email || !password) {
            return res.send('Please fill in all fields.');
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.render('auth', { error: 'User already exists! Please login.', success: null });
        }

        
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;

        if (!usernameRegex.test(username)) {
            return res.render('auth', { 
                error: 'Username can only contain alphanumeric characters, underscores, and hyphens.' 
            });
        }

        if (username.length < 3 || username.length > 15) {
            return res.render('auth', { 
                error: 'Username must be between 3 and 15 characters long.' 
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('auth', { error: 'Username is already taken!' });
        }

        // Generate a 16-byte unique salt for this user
        const salt = crypto.randomBytes(16).toString('hex');

        // Hash the password cleanly using crypto (1000 iterations, 64-char length, sha512)
        const hashedPassword = crypto.pbkdf2Sync(String(password), salt, 1000, 64, 'sha512').toString('hex');

        // Save everything into MongoDB
        user = new User({
            username,
            email,
            salt,
            password: hashedPassword
        });

        await user.save();
        return res.render('auth', { success: 'Account created successfully! Please login.', error: null });

    } catch (err) {
        console.error("Signup Error:", err.message);
        res.status(500).send('Server Error during registration');
    }
});

// LOGIN LOGIC
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.send('Please enter both email and password.');
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth', { error: 'Invalid Credentials (Email not found)', success: null });
        }

        // Hash the incoming login password using the users unique saved salt
        const verifyHash = crypto.pbkdf2Sync(String(password), user.salt, 1000, 64, 'sha512').toString('hex');

        // Direct string match check
        if (user.password !== verifyHash) {
            return res.render('auth', { error: 'Invalid Credentials (Wrong Password)', success: null });
        }

        // Redirect to dashboard
        req.session.user = {
            id: user._id,
            email: user.email
        };

        req.session.save((err) => {
            if (err) {
                console.error("Session Save Error:", err);
                return res.status(500).send("Session allocation failure");
            }
            
            return res.redirect('/');
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send('Server Error during login');
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction error: ", err);
            console.log(err);
            return res.status(500).send("Could not log you out. Please try agian");
        }
        res.clearCookie("connect.sid");

        res.redirect("/auth");
    });
});

module.exports = router;