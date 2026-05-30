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

// Display Blogs at main page + search bar logic
router.get('/', requireLogin, async (req, res) => {
  try {
    const activeUserId = req.session?.user?.id || req.session?.user?._id || null;

    // base query for public posts or users own posts
    let mainQuery = {
      $or: [
        {isPublic: true},
        {userId: activeUserId}
      ]
    };

    // add search filter for title or content
    if (req.query.search) {
      const searchRegex = {
        $regex: req.query.search,
        $options: 'i'
      };

      mainQuery.$and = [
        {
            $or: [
            {title: searchRegex},
            {content: searchRegex}
          ]
        }
      ];
    }

    const posts = await Post.find(mainQuery).populate('userId').sort({ createdAt: -1 });

    res.render('index', {
      posts: posts || [],
      user: req.session.user,
      currentSearch: req.query.search || ''
    });
  } catch (err) {
    console.error('dashboard fetch error:', err);
    res.status(500).send('error fetching dashboard posts from database.');
  }
});

// Create new blogs

router.post('/create',requireLogin, async (req, res) => {
    try {
        const { title, content, isPublic } = req.body;

        const activeUserId = req.session.user.id || req.session.user._id;

        if (!activeUserId) {
            console.error("Session User Identification is missing!");
            return res.status(401).send("Session expired. Please log in again.");
        }

        await Post.create({
            title: title.trim(),
            content: content,
            userId: activeUserId ,
            isPublic: isPublic === 'true'
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
        const post = await Post.findOne({ title: req.params.title }).populate("userId");
        if(!post) return res.status(404).send("Post not found in database");

        res.render("show", { post: post, user: req.session.user });

    } catch (err) {
        console.error("Show Post Error:", err);
        res.status(500).send("Server error fetching the story view.");
    }
});

// Editing Blogs
router.get('/edit/:title', requireLogin, async (req, res) => {
    try {

        // fetch from mongodb
        const post = await Post.findOne({ title: req.params.title });
        if (!post) return res.status(404).send('Post not found.');

        // extract userid from session
        const activeUserId = req.session.user.id || req.session.user._id;

        if (post.userId.toString() !== activeUserId.toString()){
            console.warn(`Unauthorized edit attempt by user: ${activeUserId}`);
            return res.status(403).send("Access Denied: You do not own this story.");
        }

        // render to template
        res.render('edit', { post: post, user: req.session.user });

    } catch (err) {
        console.error("Load Edit Form Error:", err);
        res.status(500).send("Server error loading the workspace parameters.");
    }
});

// Updating Blogs
router.post('/update/:title', requireLogin, async (req, res) => {
    try {
        const { content, isPublic } = req.body;
        const activeUserId = req.session.user.id || req.session.user._id;
        const post = await Post.findOne({ title: req.params.title });
        
        if(!post) return res.status(404).send("Post not found in database");
        
        if (post.userId.toString() !== activeUserId.toString()){
            return res.status(403).send("Access Denied: You do not own this story.");
        }

        post.content = content;
        post.isPublic = isPublic === 'true';
        await post.save();
        
        res.redirect(`/post/${encodeURIComponent(req.params.title)}`);
    } catch (err) {
        console.error("Update Post Error:", err);
        res.status(500).send("Error executing document modifications.");
    }
});

// Deleting Blogs
router.post('/delete/:title', requireLogin, async (req, res) => {
    try {
        const activeUserId = req.session.user.id || req.session.user._id;
        const post = await Post.findOne({ title: req.params.title });
        
        if(!post) return res.status(404).send("Post not found in database");

        if (post.userId.toString() !== activeUserId.toString()){
            return res.status(403).send("Access Denied: You do not own this story.");
        }

        await Post.deleteOne({ _id: post._id });
        res.redirect('/');

    } catch (err) {
        console.error("Delete Post Error:", err);
        res.status(500).send("Error removing the selected document entry.");
    }
});
 
module.exports = router;