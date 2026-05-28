const express = require('express');
const router = express.Router();
// const { getAllPosts, getPost, createPost, updatePost, deletePost } = require('../utils/fileUtils');
const Post = require('../models/Post');


// Checks if the user is logged in
function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/auth');
    }
    next();
}

// Display Blogs at main page
router.get('/', requireLogin, async (req, res) => {
    try {

        const posts = await Post.find().sort({
            createdAt: -1
        });

        res.render('index', { 
        posts: posts || [], 
        user: req.session.user,
        currentSearch: req.query.search || '' 
    });


    } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        res.status(500).send("Error fetching dashboard posts from database.");
    }
    
});

// Create new blos 

router.post('/create',requireLogin, async (req, res) => {
    try {
        const { title, content } = req.body;

        const activeUserId = req.session.user.id || req.session.user._id;

        if (!activeUserId) {
            console.error("Session User Identification is missing!");
            return res.status(401).send("Session expired. Please log in again.");
        }

        await Post.create({
            title: title.trim(),
            content: content,
            userId: activeUserId 
        });
        res.redirect('/');

    } catch (err) {
        console.error("Create Post Error:", err);
        res.status(500).send("Error saving to the database.");
    }
});


// Fetching Blogs
router.get('/post/:title',requireLogin, async (req, res) => {
    try {
        const post = await Post.findOne({ title: req.params.title });
        if(!post) return res.status(404).send("Post not found in database");

        res.render("show", {title: post.title, content: post.content});

    } catch (err) {
        console.error("Show Post Error:", err);
        res.status(500).send("Server error fetching the story view.");
    }
});

// Editing Blogs
router.get('/edit/:title', requireLogin, async (req, res) => {
    try {
        const post = await Post.findOne({ title: req.params.title });
        if (!post) return res.status(404).send('Post not found.');
        
        res.render('edit', { title: post.title, content: post.content });
    } catch (err) {
        console.error("Load Edit Form Error:", err);
        res.status(500).send("Server error loading the workspace parameters.");
    }
});

// Updating Blogs
router.post('/update/:title', requireLogin, async (req, res) => {
    try {
        const { content } = req.body;
        
        await Post.findOneAndUpdate(
            { title: req.params.title }, 
            { content: content },
            { new: true }
        );
        
        res.redirect(`/post/${encodeURIComponent(req.params.title)}`);
    } catch (err) {
        console.error("Update Post Error:", err);
        res.status(500).send("Error executing document modifications.");
    }
});

// Deleting Blogs
router.post('/delete/:title', requireLogin, async (req, res) => {
    try {
        await Post.deleteOne({ title: req.params.title });
        res.redirect('/');
    } catch (err) {
        console.error("Delete Post Error:", err);
        res.status(500).send("Error removing the selected document entry.");
    }
});
 
module.exports = router;