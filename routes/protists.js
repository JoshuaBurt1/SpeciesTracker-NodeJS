// Import express and create a router object
const express = require("express");
const multer = require('multer');
const path = require('path');
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const Protist = require("../models/protist"); // Import mongoose model to be used

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/protist_images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

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


//INDEX view
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

//ADD view POST
router.post("/add", upload.single('image'), (req, res, next) => {

  // Use req.file.path to get the path of the uploaded image
  var imagePath = req.file.path;
  imagePath = path.basename(imagePath);
  console.log(imagePath); // Print the path of the uploaded image to the console)

  // Create a new Protist with the uploaded image path
  Protist.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: imagePath, // Save the path to the uploaded image
    link: req.body.link,
  })
    .then((createdModel) => {
      console.log("Model created successfully:", createdModel);
      res.redirect("/protists");
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
});


//ADD view GET
router.get("/add", logMiddleware, (req, res, next) => {
  res.render("protists/add", { title: "Add a new Protist" });
});

//EDIT view GET
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
  }
});

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
  Protist.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: imagePath,
      link: req.body.link,
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
