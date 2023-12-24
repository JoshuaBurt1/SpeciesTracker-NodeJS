// Import express and create a router object
const express = require("express");
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const Protist = require("../models/protist"); // Import mongoose model to be used

// add reusable middleware function to inject it in our handlers below that need authorization
//   1. prevents non-logged in viewer from seeing add button in protists
//   2. does not stop non-logged in viewer from entering URL to view: 
//   http://localhost:3000/Protists/add
//   3. Adding to route prevents users from accessing page by URL modification: 
//   function IsLoggedIn(req,res,next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/login');
//   }

//LOGIN
// function IsLoggedIn(req,res,next) {
//   if (req.isAuthenticated()) {
//       return next();
//   }
//   res.redirect('/login');
// }

//Configure GET/POST handlers
//GET handler for index /protists/ <<landing/root page of my section
//R > Retrieve/Read usually shows a list (filtered/unfiltered)
router.get("/", logMiddleware, (req, res, next) => {
  //res.render("protists/index", { title: "Protist Tracker" });
  //renders data in table
  Protist.find() //sorting function (alphabetically)
    .then((protists) => {
      res.render("protists/index", {
        title: "Protist Tracker Dataset",
        dataset: protists,
        //user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});


//POST handler (save button action)
router.post("/add", (req, res, next) => {
  //res.redirect("/protists");
  //use the protist module to save data to DB
  Protist.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: req.body.image,
    link: req.body.link,
  })
    .then((createdModel) => {
      console.log("Model created successfully:", createdModel);
      // We can show a successful message by redirecting them to index
      res.redirect("/protists");
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
});

//TODO C > Create new protist
//GET handler for /protists/add (loads)
router.get("/add", logMiddleware, (req, res, next) => {
  res.render("protists/add", { title: "Add a new Protist" });
});

//POST handler for /protists/add (receives input data)
router.post("/add", (req, res, next) => {
  Protist.create(
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: req.body.image,
      link: req.body.link,
    }, //new protist to add
    (err, newProtist) => {
      res.redirect("/protists");
    } // callback function
  );
});

//note: NEED TO COMBINE THESE 2 FUNCTIONS TO RENDER ASYNCHRONOUSLY (see below)
router.get("/edit/:_id", logMiddleware, async (req, res, next) => {
  try {
    const protistObj = await Protist.findById(req.params._id).exec();
    res.render("protists/edit", {
      title: "Edit a Protist Entry",
      protist: protistObj
      //user: req.user,
    });
  } catch (err) {
    console.error(err);
    // Handle the error appropriately
  }
});

// POST /protists/editID
router.post("/edit/:_id", (req, res, next) => {
  Protist.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: req.body.image,
      link: req.body.link
    }
  )
    .then((updatedProtist) => {
      res.redirect("/protists");
    })
    .catch((err) => {
      // handle any potential errors here
      // For example, you can redirect to an error page
      res.redirect("/error");
    });
});

//TODO D > Delete a protist
// GET /protists/delete/652f1cb7740320402d9ba04d
router.get("/delete/:_id", (req, res, next) => {
  let protistId = req.params._id;
  Protist.deleteOne({ _id: protistId })
    .then(() => {
      res.redirect("/protists");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

// Export this router module
module.exports = router;
