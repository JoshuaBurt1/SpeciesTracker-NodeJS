var express = require('express');
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var logMiddleware = require('../logMiddleware'); //route logging middleware

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
});


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

/* GET handlers */
//homepage
router.get('/', logMiddleware, function(req, res, next) {
  res.render('index', { user: req.user, title: 'Species Tracker'});
});

//okay for single pages without routes themselves
router.get("/forum", logMiddleware, (req, res, next) => {
  res.render("forum", { title: "Forum", user: req.user  });
});


// Import Mongoose models
const Animal = require("../models/animal");
const Fungus = require("../models/fungus");
const Plant = require("../models/plant");
const Protist = require("../models/protist");

const pageSize = 4;

router.get("/dataViewer", logMiddleware, async (req, res, next) => {
  try {
    // SearchBar query parameter
    let searchQuery = req.query.searchBar || '';

    let page = parseInt(req.query.page) || 1;  // Define the page variable
    let skipSize = pageSize * (page - 1);

    // Fetch data from each model without pagination
    const [animalData, fungusData, plantData, protistData] = await Promise.all([
      Animal.find({ name: { $regex: new RegExp(searchQuery, 'i') } }).sort({ name: 1 }),
      Fungus.find({ name: { $regex: new RegExp(searchQuery, 'i') } }).sort({ name: 1 }),
      Plant.find({ name: { $regex: new RegExp(searchQuery, 'i') } }).sort({ name: 1 }),
      Protist.find({ name: { $regex: new RegExp(searchQuery, 'i') } }).sort({ name: 1 }),
      // Add queries for other models (Plant, Protist) if needed
    ]);

    // Combine data from different models into a single array
    const combinedData = [...animalData, ...fungusData, ...plantData, ...protistData];
    // Add data from other models if needed
// Sort the combined data by name
combinedData.sort((a, b) => a.name.localeCompare(b.name));

const totalRecords = combinedData.length;
const totalPages = Math.ceil(totalRecords / pageSize);

// Fetch paginated data after combining and sorting
const paginatedData = combinedData.slice(skipSize, skipSize + pageSize);

// Render the dataViewer page with the paginated data
res.render("dataViewer", {
  title: "Data Viewer",
  user: req.user,
  dataset: paginatedData,
  searchQuery: searchQuery,
  totalPages: totalPages,
  currentPage: page,
});
} catch (err) {
console.log(err);
res.status(500).send("Internal Server Error");
}
});

router.get("/error", logMiddleware,  (req, res, next) => {
  res.render("error", { title: "Error" });
});

module.exports = router;