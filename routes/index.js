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
    let searchQuery = req.query.searchBar || '';
    let kingdomQuery = req.query.searchBar || '';

    // Create a function to fetch data from a specific model
    const fetchData = async (model) => {
      return await model.find({
        $or: [
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { kingdom: { $regex: new RegExp(kingdomQuery, 'i') } },
        ],
      }).sort({ name: 1 });
    };

    // Fetch data from each model without pagination
    const [animalData, fungusData, plantData, protistData] = await Promise.all([
      fetchData(Animal),
      fetchData(Fungus),
      fetchData(Plant),
      fetchData(Protist),
      // Add queries for other models (Plant, Protist) if needed
    ]);

    // Combine data from different models into a single array
    const combinedData = [...animalData, ...fungusData, ...plantData, ...protistData];

    // Group entries by name and collect locations, update dates, and images into arrays
    const groupedData = combinedData.reduce((acc, item) => {
      const existingItem = acc.find((groupedItem) => groupedItem.name === item.name);
    
      if (existingItem) {
        existingItem.locations.push(item.location);
        existingItem.updateDates.push(item.updateDate);
        existingItem.images.push(item.image);
      } else {
        acc.push({
          name: item.name,
          kingdom: item.kingdom,
          locations: [item.location],
          updateDates: [item.updateDate],
          images: [item.image]
        });
      }
    
      return acc;
    }, []);
    
    // Sort each named entry by updateDate keeping association to location & image
    groupedData.forEach((group) => {
      const zippedData = group.updateDates.map((updateDate, index) => ({
        updateDate,
        location: group.locations[index],
        image: group.images[index]
      }));
      zippedData.sort((a, b) => a.updateDate.localeCompare(b.updateDate));
      group.locations = zippedData.map((item) => item.location);
      group.updateDates = zippedData.map((item) => item.updateDate);
      group.images = zippedData.map((item) => item.image);
    });

    //API source
    console.log(groupedData);

    const totalRecords = groupedData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Paginate the grouped data
    const page = parseInt(req.query.page) || 1;
    const skipSize = pageSize * (page - 1);
    const paginatedData = groupedData.slice(skipSize, skipSize + pageSize);

    // Render the dataViewer page with the paginated data
    res.render("dataViewer", {
      title: "Data Viewer",
      user: req.user,
      dataset: paginatedData,
      searchQuery: searchQuery,
      kingdomQuery: kingdomQuery,
      totalPages: totalPages,
      currentPage: page,
    });
    
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// Group and sort data API endpoint
router.get("/api", async (req, res) => {
  try {
    let searchQuery = req.query.searchBar || "";
    let kingdomQuery = req.query.searchBar || "";

    // Create a function to fetch data from a specific model
    const fetchData = async (model) => {
      return await model.find({
        $or: [
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { kingdom: { $regex: new RegExp(kingdomQuery, 'i') } },
        ],
      }).sort({ name: 1 });
    };

    // Fetch data from each model without pagination
    const [animalData, fungusData, plantData, protistData] = await Promise.all([
      fetchData(Animal),
      fetchData(Fungus),
      fetchData(Plant),
      fetchData(Protist),
      // Add queries for other models (Plant, Protist) if needed
    ]);

    // Combine data from different models into a single array
    const combinedData = [...animalData, ...fungusData, ...plantData, ...protistData];

    // Group entries by name and collect locations, update dates into arrays
    const groupedData = combinedData.reduce((acc, item) => {
      const existingItem = acc.find((groupedItem) => groupedItem.name === item.name);

      if (existingItem) {
        existingItem.locations.push(item.location);
        existingItem.updateDates.push(item.updateDate);
        // Exclude pushing item.image into the images array
      } else {
        acc.push({
          name: item.name,
          kingdom: item.kingdom,
          locations: [item.location],
          updateDates: [item.updateDate],
          // Exclude creating images array and pushing item.image
        });
      }

      return acc;
    }, []);

    // Sort each named entry by updateDate keeping association to location
    groupedData.forEach((group) => {
      const zippedData = group.updateDates.map((updateDate, index) => ({
        updateDate,
        location: group.locations[index],
        // Exclude including image in zippedData
      }));
      zippedData.sort((a, b) => a.updateDate.localeCompare(b.updateDate));
      group.locations = zippedData.map((item) => item.location);
      group.updateDates = zippedData.map((item) => item.updateDate);
      // Exclude creating and mapping the images array
    });

    // Respond with the groupedData in JSON format
    res.json(groupedData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/error", logMiddleware,  (req, res, next) => {
  res.render("error", { title: "Error" });
});

module.exports = router;