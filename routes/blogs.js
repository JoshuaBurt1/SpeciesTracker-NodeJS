const express = require('express');
const app = express();

// Add this middleware to parse form data
app.use(express.urlencoded({ extended: true }));
const router = express.Router();
const Blog = require("../models/blog");

// Middleware for route logging
const logMiddleware = require("../logMiddleware");
// Middleware for user authentication
const IsLoggedIn = require("../extensions/authentication");

// User login not required to view
router.get("/", logMiddleware, async (req, res, next) => {
    try {
        const blogs = await Blog.find({ users: req.session.userId });
        res.render("blogs/index", {
            user: req.user,
            blogs: blogs,
            title: "Species Tracker Forum"
        });
    } catch (err) {
        console.error(`ERROR: ${err}`);
        res.redirect("/error");
    }
});

router.post('/add', IsLoggedIn, (req, res) => {
    console.log('Form Data:', req.body);
  
    Blog.create({
      title: req.body.title,
      content: req.body.content,
      user: req.user._id,
    })
    .then((createdModel) => {
      console.log("Model created successfully:", createdModel);
      res.redirect("/blogs");
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
  });
  
//GET handler for /blogs/add (loads)
router.get("/add", IsLoggedIn, logMiddleware, (req, res, next) => {
    res.render("blogs/add", { 
        user: req.user, 
        title: "Add a new Blog" });
});

router.get("/edit/:_id", IsLoggedIn, logMiddleware, async  (req, res, next) => {
    try {
      const blogObj = await Blog.findById(req.params._id).exec();
      console.log(blogObj);
      res.render("blogs/edit", {
        user: req.user,
        title: "Edit a Blog Entry",
        blog: blogObj
        //user: req.user,
      });
    } catch (err) {
      console.error(err);
      // Handle the error appropriately
    }
  });

  router.post("/edit/:_id", IsLoggedIn, (req, res, next) => {
    // Continue with the update logic
    Blog.findOneAndUpdate(
        { _id: req.params._id },
        {
            title: req.body.name,
            content: req.body.content,
            status: req.body.updateDate,
            user: req.user._id,
        },
        { new: true } // to return the updated document
    )
        .then((updatedBlog) => {
            console.log("Updated Blog:", updatedBlog);
            res.redirect("/blogs/" + req.params._id); // Redirect to the edited blog's page
        })
        .catch((err) => {
            console.error(err);
            res.redirect("/error");
        });
});

// User login not required to view
router.get("/:id", logMiddleware, async (req, res) => {
    try {
        let blogId = req.params.id; // Use req.params.id to get the blog ID
        
        const blog = await Blog.findOne({  _id: blogId
        });

        console.log("Blog retrieved successfully:", blog);

        res.render("blogs/show", {
            user: req.user,
            blog: blog,
            title: blog.title
        });
    } catch (err) {
        console.error(err);
        res.redirect("/error");
    }
});

router.get("/delete/:id", IsLoggedIn, async (req, res) => {
    try {
        let blogId = req.params.id; // Use req.params.id to get the blog ID
    
        // Delete the blog from the database
        await Blog.deleteOne({ _id: blogId });
        console.log(blogId);
    
        res.redirect("/blogs");
    } catch (err) {
        console.error(err);
        res.redirect("/error");
    }
});


module.exports = router;