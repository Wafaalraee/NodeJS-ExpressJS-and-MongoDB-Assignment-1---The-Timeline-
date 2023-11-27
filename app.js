const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ejs = require('ejs')
const methodOverride = require('method-override'); // Add this line
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://wafa:1234@cluster0.rilnusk.mongodb.net/wafa?retryWrites=true&w=majority');

// Define a Mongoose schema
const postSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        minlength: 25,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create a Mongoose model based on the schema
const Post = mongoose.model('Post', postSchema);
// register view engine
app.set('view engine', 'ejs');
// Use morgan for logging
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); 
app.use(express.static('public'));

// Middleware for form validation
const validateForm = (req, res, next) => {
    const postMessage = req.body.postMessage;
    if (!postMessage || postMessage.length < 25) {
        return res.status(400).send('Post message must be at least 25 characters long.');
    }
    next();
};

app.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Sort by createdAt
        res.render('index', { posts: posts });
    } catch (error) {
        console.error('Error fetching posts from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});
//Add post
app.post('/posts', validateForm, async (req, res) => {
    const postMessage = req.body.postMessage;

    try {
        const post = new Post({
            message: postMessage,
        });
        await post.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error saving post to MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add the delete route
app.delete('/posts/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        await Post.findByIdAndDelete(postId);
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting post from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});
// Catch-all route for handling 404 errors
app.use((req, res) => {
    res.status(404).render('404');
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});





