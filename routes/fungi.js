// Import express and create a router object
const express = require("express");
const multer = require('multer');
const path = require('path');
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const Fungus = require("../models/fungus"); // Import mongoose model to be used

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/fungus_images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

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
//GET handler for index /fungis/ <<landing/root page of my section
//R > Retrieve/Read usually shows a list (filtered/unfiltered)
const pageSize = 4;
router.get('/', logMiddleware, async (req, res, next) => {
  try {
    //SearchBar query parameter
    let searchQuery = req.query.searchBar;
    if (!searchQuery) {
      searchQuery = '';
    }

    // Use a case-insensitive regular expression to match part of the name
    let query = {};
    if (searchQuery) {
      query = { name: { $regex: new RegExp(searchQuery, 'i') } };
      console.log(query);
    }

    let page = parseInt(req.query.page) || 1;
    let skipSize = pageSize * (page - 1);

    const fungi = await Fungus.find(query)
      .sort({ name: 1 })
      .limit(pageSize)
      .skip(skipSize);

    const totalRecords = await Fungus.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / pageSize);

    res.render("fungi", {
      title: "Fungus Dataset",
      dataset: fungi,
      searchQuery: searchQuery,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

//ADD view POST
router.post("/add", upload.single('image'), (req, res, next) => {

  // Use req.file.path to get the path of the uploaded image
  var imagePath = req.file.path;
  imagePath = path.basename(imagePath);
  console.log(imagePath); // Print the path of the uploaded image to the console)

  // Create a new Fungus with the uploaded image path
  Fungus.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: imagePath, // Save the path to the uploaded image
  })
    .then((createdModel) => {
      console.log("Model created successfully:", createdModel);
      res.redirect("/fungi");
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
});

//TODO C > Create new fungus
//GET handler for /fungi/add (loads)
router.get("/add", logMiddleware, (req, res, next) => {
  res.render("fungi/add", { title: "Add Fungus" });
});

router.get("/edit/:_id", logMiddleware, async (req, res, next) => {
  try {
    const fungusObj = await Fungus.findById(req.params._id).exec();
    res.render("fungi/edit", {
      title: "Edit a Fungus Entry",
      fungus: fungusObj
      //user: req.user,
    });
  } catch (err) {
    console.error(err);
    // Handle the error appropriately
  }
});

// POST /fungi/editID
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
  Fungus.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: imagePath,
    }
  )
    .then((updatedFungus) => {
      res.redirect("/fungi");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

//TODO D > Delete a fungus
// GET /fungi/delete/652f1cb7740320402d9ba04d
router.get("/delete/:_id", (req, res, next) => {
  let fungusId = req.params._id;
  Fungus.deleteOne({ _id: fungusId })
    .then(() => {
      res.redirect("/fungi");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

// Export this router module
module.exports = router;