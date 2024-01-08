// Import express and create a router object
const express = require("express");
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const IsLoggedIn = require("../extensions/authentication");

//Mongoose models
const Blog = require('../models/blog');
router.get('/new', (req, res) => {
    res.render('blogs/new', {
        title: 'New Blog Post'
    });
});

router.post('/create', async (req, res) => {
    try {
        await Blog.create(req.body.blog);
        res.redirect('/blogs');
    } catch (err) {
        console.log(`ERROR: ${err}`);
        res.redirect('/error');
    }
});

router.get('/drafts', async (req, res) => {
    try {
        const drafts = await Blog.find().drafts();
        res.render('blogs/index', {
            blogs: drafts,
            title: 'Drafts'
        });
    } catch (err) {
        console.log(`ERROR: ${err}`);
        res.redirect('/error');
    }
});

router.get('/published', async (req, res) => {
    try {
        const published = await Blog.find().published();
        res.render('blogs/index', {
            blogs: published,
            title: 'Published'
        });
    } catch (err) {
        console.log(`ERROR: ${err}`);
        res.redirect('/error');
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        res.render('blogs/edit', {
            blog: blog,
            title: `Edit ${blog.title}`
        });
    } catch (err) {
        console.log(`ERROR: ${err}`);
        res.redirect('/error');
    }
});

router.post('/update', async (req, res) => {
    try {
        await Blog.updateOne({
            _id: req.body.id
        }, req.body.blog, {
            runValidators: true
        });
        res.redirect('/blogs');
    } catch (err) {
        console.log(`ERROR: ${err}`);
        res.redirect('/error');
    }
});

router.post('/delete', async (req, res) => {
    try {
        await Blog.deleteOne({
            _id: req.body.id
        });
        res.redirect('/blogs');
    } catch (err) {
        console.log(`ERROR: ${err}`);
        res.redirect('/error');
    }
});

router.get('/:id', logMiddleware, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        res.render('blogs/show', {
            blog: blog,
            title: blog.title
        });
    } catch (err) {
        console.error(err);
        res.redirect("/error");
    }
});

router.get('/', logMiddleware, async (req, res, next) => {
    try {
        const blogs = await Blog.find();
        res.render('blogs/index', {
            user: req.user,
            blogs: blogs,
            title: 'Archive'
        });
    } catch (err) {
        console.log(`ERROR: ${err}`);
        res.redirect('/error');
    }
});

module.exports = router;