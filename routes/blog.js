const express = require('express');
const router = express.Router();
const { getAllPosts, getPost, createPost, updatePost, deletePost } = require('../utils/fileUtils');

router.get('/', (req, res) => {
    const posts = getAllPosts();
    res.render('index', { posts });
});

router.get('/new', (req, res) => {
    res.render('new');
});

router.post('/create', (req, res) => {
    const { title, content } = req.body;
    createPost(title, content);
    res.redirect('/');
});

router.get('/post/:title', (req, res) => {
    const title = req.params.title;
    const content = getPost(title);
    if (!content) return res.status(404).send("Post not found");
    res.render('show', { title, content });
});

router.get('/edit/:title', (req, res) => {
    const title = req.params.title;
    const content = getPost(title);
    if(!content) return res.status(404).send('Post not found');
    res.render('edit', { title, content });
});

router.post('/update/:title', (req, res) => {
    const title = req.params.title;
    const content = req.body.content;
    updatePost(title, content);
    res.redirect(`/post/${title}`);
});

router.post('/delete/:title', (req, res) => {
    deletePost(req.params.title);
    res.redirect('/');
});

module.exports = router;