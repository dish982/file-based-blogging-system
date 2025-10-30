const fs = require('fs');
const path = require('path');
const postsDir = path.join(__dirname, "posts");
const { marked } = require('marked');

if (!fs.existsSync(postsDir)){
    fs.mkdirSync(postsDir);
}

function getAllPosts() {
    return fs.readdirSync(postsDir).map(
        file => {
            const content = fs.readFileSync(path.join(postsDir, file),'utf8');
            return { title: file.replace('.md', ''), content };
        });
}        

function getPost(title) {
    const filePath = path.join(postsDir, `${title}.md`);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return marked(content);
}

function createPost(title, content) {
    fs.writeFileSync(path.join(postsDir, `${title}.md`), content, 'utf8');
}

function updatePost(title, content) {
    fs.writeFileSync(path.join(postsDir, `${title}.md`), content, 'utf8');
}

function deletePost(title) {
    const filePath = path.join(postsDir, `${title}.md`);
    if (fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
    }
}

module.exports = {
    getAllPosts, getPost, createPost, updatePost, deletePost
};