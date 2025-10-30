const express = require('express');
const path = require('path');
const blogRoutes = require('./routes/blog');
const app = express();
const PORT = 3000;

//Set view engine to EJS //Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Serve static files (css, images)
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/', blogRoutes);

//Start the server 
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}/`);
});