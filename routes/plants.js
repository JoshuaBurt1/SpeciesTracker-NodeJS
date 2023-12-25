// Import express and create a router object
const express = require("express");
const multer = require('multer');
const path = require('path');
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const Plant = require("../models/plant"); // Import mongoose model to be used

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/plant_images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// add reusable middleware function to inject it in our handlers below that need authorization
//   1. prevents non-logged in viewer from seeing add button in plants
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
//GET handler for index /plants/ <<landing/root page of my section
//R > Retrieve/Read usually shows a list (filtered/unfiltered)
router.get("/", logMiddleware, (req, res, next) => {
  //res.render("plants/index", { title: "Plant Tracker" });
  //renders data in table
  Plant.find() //sorting function (alphabetically)
    .then((plants) => {
      res.render("plants/index", {
        title: "Plant Tracker Dataset",
        dataset: plants,
        //user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//ADD view POST
router.post("/add", upload.single('image'), (req, res, next) => {

  // Use req.file.path to get the path of the uploaded image
  var imagePath = req.file.path;
  imagePath = path.basename(imagePath);
  console.log(imagePath); // Print the path of the uploaded image to the console)

  // Create a new Plant with the uploaded image path
  Plant.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: imagePath, // Save the path to the uploaded image
    link: req.body.link,
  })
    .then((createdModel) => {
      console.log("Model created successfully:", createdModel);
      res.redirect("/plants");
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
});

//TODO C > Create new plant
//GET handler for /plants/add (loads)
router.get("/add", logMiddleware, (req, res, next) => {
  res.render("plants/add", { title: "Add a new Plant" });
});

router.get("/edit/:_id", logMiddleware, async (req, res, next) => {
  try {
    const plantObj = await Plant.findById(req.params._id).exec();
    res.render("plants/edit", {
      title: "Edit a Plant Entry",
      plant: plantObj
      //user: req.user,
    });
  } catch (err) {
    console.error(err);
    // Handle the error appropriately
  }
});

// POST /plants/editID
router.post("/edit/:_id", upload.single('image'), (req, res, next) => {
  // Check if a file was uploaded
  if (req.file) {
    // Use req.file.path to get the path of the uploaded image
    var imagePath = req.file.path;
    imagePath = path.basename(imagePath);
    console.log(imagePath); // Print the path of the uploaded image to the console)
  } else {
    // No file was uploaded, use the existing image path
    var imagePath = req.body.image;
  }

  // Continue with the update logic
  Plant.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: imagePath,
      link: req.body.link,
    }
  )
    .then((updatedPlant) => {
      res.redirect("/plants");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

//TODO D > Delete a plant
// GET /plants/delete/652f1cb7740320402d9ba04d
router.get("/delete/:_id", (req, res, next) => {
  let plantId = req.params._id;
  Plant.deleteOne({ _id: plantId })
    .then(() => {
      res.redirect("/plants");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

// Export this router module
module.exports = router;
