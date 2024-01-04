var express = require('express');
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var logMiddleware = require('../logMiddleware'); //route logging middleware
const fs = require('fs'); // required to make file system directories
const path = require('path'); //required to add subdirectories

// GET handler for /login
router.get("/login", logMiddleware, (req, res, next) => {
  let messages = req.session.messages || []; //if null set an empty list
  req.session.messages = []; //clear messages
  res.render("login", {user: req.user, title: "Login to the App", messages: messages });
});

//POST /login (user click login button)
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: "Invalid Credentials",
  })
);

// GET handler for /register (user loads page)
router.get("/register", logMiddleware, (req, res, next) => {
  res.render("register", {user: req.user, title: "Create an Account" });
});

//POST handler for /register
/*
router.post("/register", (req, res, next) => {
  // Create a new user based on the information from the page
  User.register(
    new User({
      username: req.body.username,
    }),
    req.body.password,
    (err, newUser) => {
      if (err) {
        console.log(err);
        // take user back and reload register page
        return res.redirect("/register");
      } else {
        // log user in
        req.login(newUser, (err) => {
          res.redirect("/");
        });
      }
    }
  );
});*/

router.post("/register", (req, res, next) => {
    // Create a new user based on the information from the page
    User.register(
      new User({
        username: req.body.username,
      }),
      req.body.password,
      (err, newUser) => {
        if (err) {
          console.log(err);
          // take user back and reload register page
          return res.redirect("/register");
        } else {
          // log user in
          req.login(newUser, (err) => {
            // Create a directory for the user in public/images
            var userDirectory = `public/images/${newUser._id}`;

            try {
              // Check if the directory already exists
              if (!fs.existsSync(userDirectory)) {
                // Create the directory
                fs.mkdirSync(userDirectory);

                // Create subdirectories inside the user directory
                var subdirectories = ['animal_images', 'fungus_images', 'plant_images', 'protist_images'];

                subdirectories.forEach(subdirectory => {
                  const subdirectoryPath = path.join(userDirectory, subdirectory);
                  fs.mkdirSync(subdirectoryPath);
                  console.log(`Subdirectory created: ${subdirectoryPath}`);
                });

                console.log(`Directories created for user: ${newUser.username}`);
              }
            } catch (mkdirErr) {
              console.error(`Error creating directories: ${mkdirErr}`);
            }

            res.redirect("/");
          });
        }
      }
    );
  }
  );


// GET handler for logout
router.get("/logout", logMiddleware, (req, res, next) => {
  req.logout(function (err) {
    res.redirect("/login");
  });
});

// GET handler /github passport authenticate and pass the name of the strategy 
router.get('/github', passport.authenticate('github', { scope: ['user.email'] }));
// GET handler for /github/callback 
// this is the url they come back to after entering their credentials
router.get('/github/callback',
  // callback to send user back to login if unsuccessful
  passport.authenticate('github', { failureRedirect: '/login' }),
  
  // callback when login is successful
  (req, res, next) => { res.redirect('/') }
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res, next) => {
    try {
      var newUser = req.user; // Assuming user object is available after GitHub authentication

      // Create a directory for the user in public/images
      var userDirectory = `public/images/${newUser._id}`;

      try {
        // Check if the directory already exists
        if (!fs.existsSync(userDirectory)) {
          // Create the directory
          fs.mkdirSync(userDirectory);

          // Create subdirectories inside the user directory
          var subdirectories = ['animal_images', 'fungus_images', 'plant_images', 'protist_images'];

          subdirectories.forEach(subdirectory => {
            const subdirectoryPath = path.join(userDirectory, subdirectory);
            fs.mkdirSync(subdirectoryPath);
            console.log(`Subdirectory created: ${subdirectoryPath}`);
          });

          console.log(`Directories created for user: ${newUser.username}`);
        }
      } catch (mkdirErr) {
        console.error(`Error creating directories: ${mkdirErr}`);
      }

      res.redirect('/');
    } catch (error) {
      console.error(`GitHub callback error: ${error}`);
      res.status(500).send('Internal Server Error');
    }
  }
);

/* GET handlers */
//homepage
router.get('/', logMiddleware, function(req, res, next) {
  res.render('index', { user: req.user, title: 'Species Tracker'});
});

//okay for single pages without routes themselves
router.get("/forum", logMiddleware, (req, res, next) => {
  res.render("forum", { title: "Forum", user: req.user  });
});
router.get("/identification", logMiddleware,  (req, res, next) => {
  res.render("identification", { title: "Identification", user: req.user });
});

router.get("/error", logMiddleware,  (req, res, next) => {
  res.render("error", { title: "Error" });
});

module.exports = router;