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

router.get("/", logMiddleware, async (req, res, next) => {
    try {
        const blogs = await Blog.find({ users: req.session.userId });
        const user = req.user || {}; // Ensure user is always an object

        res.render("blogs/index", {
            user: req.user,
            admin: user.admin, // Set a default value if admin is not present
            blogs: blogs,
            title: "Message Board"
        });
    } catch (err) {
        console.error(`ERROR: ${err}`);
        res.redirect("/error");
    }
});

router.post('/add', IsLoggedIn, (req, res) => {
    console.log('Form Data:', req.body);

    Blog.create({
        topic: req.body.topic, // Use the topic from the form
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
        // Handle the error appropriately, e.g., by redirecting back to the form with an error message
        res.redirect("/blogs/add");
    });
});
  
//GET handler for /blogs/add (loads)
router.get("/add", IsLoggedIn, logMiddleware, (req, res, next) => {
    res.render("blogs/add", { 
        user: req.user, 
        title: "Add a new Blog",
        topic: req.query.topic // Pass the topic from the query parameters
    });
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
            topic: req.body.topic,
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
const pageSize = 5; // Number of replies per page

router.get("/:id", logMiddleware, async (req, res) => {
    try {
        let blogId = req.params.id;

        const blog = await Blog.findOne({ _id: blogId });

        if (!blog) {
            console.error("Blog not found");
            return res.redirect("/error");
        }

        const numberOfReplies = blog.replies.length;

        console.log("Blog retrieved successfully:", blog);
        console.log("Number of replies:", numberOfReplies);

        // Pagination logic
        const page = parseInt(req.query.page) || 1;
        const skipSize = pageSize * (page - 1);
        const endIndex = Math.min(skipSize + pageSize, numberOfReplies);

        const paginatedReplies = blog.replies.slice(skipSize, endIndex);

        const totalPages = Math.ceil(numberOfReplies / pageSize);

        res.render("blogs/replies", {
            user: req.user,
            blog: blog,
            numberOfReplies: numberOfReplies,
            title: blog.title,
            req: req, // Pass the req object
            paginatedReplies: paginatedReplies,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (err) {
        console.error(err);
        res.redirect("/error");
    }
});

router.post("/:id", logMiddleware, async (req, res) => {
    try {
        let blogId = req.params.id;
        let replyContent = req.body.content;
        let userId = req.user._id;

        // Add the reply to the blog post with the user ID
        const blog = await Blog.findOneAndUpdate(
            { _id: blogId },
            {
                $push: {
                    replies: {
                        content: replyContent,
                        user: userId
                    }
                }
            },
            { new: true }
        );

        // Send a response (you can customize this based on your requirements)
        res.status(200).json({ success: true, blog });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

//DELETE POST
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

// GET handler for editing a reply (loads)
router.get("/editReply/:blogId/:replyId", IsLoggedIn, logMiddleware, async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const replyId = req.params.replyId;

        const blog = await Blog.findById(blogId);

        if (!blog) {
            console.error("Blog not found");
            return res.redirect("/error");
        }

        // Find the correct reply using the replyId
        const reply = blog.replies.find(r => r._id.toString() === replyId);

        if (!reply) {
            console.error("Reply not found");
            return res.redirect("/error");
        }

        res.render("blogs/editReply", {
            user: req.user,
            title: "Edit Reply",
            blogId: blog._id,
            reply: reply,
            blog: blog, // Add this line to pass the 'blog' variable to the view
        });
    } catch (err) {
        console.error(err);
        res.redirect("/error");
    }
});

// POST handler for updating a reply
router.post("/editReply/:blogId/:replyId", IsLoggedIn, async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const replyId = req.params.replyId;

        const updatedContent = req.body.content;

        const blog = await Blog.findOneAndUpdate(
            { _id: blogId, "replies._id": replyId },
            { $set: { "replies.$.content": updatedContent } },
            { new: true }
        );

        if (!blog) {
            console.error("Blog not found");
            return res.redirect("/error");
        }

        res.redirect(`/blogs/${blogId}`);
    } catch (err) {
        console.error(err);
        res.redirect("/error");
    }
});

// GET handler for deleting a reply
router.get("/deleteReply/:blogId/:replyId", IsLoggedIn, async (req, res) => {
    try {
        const { blogId, replyId } = req.params;

        // Find the blog by ID and update replies array by removing the specified reply
        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            { $pull: { replies: { _id: replyId } } },
            { new: true }
        );

        if (!updatedBlog) {
            console.error("Blog not found");
            return res.redirect("/error");
        }

        console.log("Reply deleted successfully");
        res.redirect(`/blogs/${blogId}`);
    } catch (err) {
        console.error(err);
        res.redirect("/error");
    }
});

module.exports = router;