// Import express and create a router object
const express = require("express");
const multer = require('multer');
const path = require('path');
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const IsLoggedIn = require("../extensions/authentication");

//Mongoose models
const Animal = require("../models/animal"); // Import mongoose model to be used

//File storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/animal_images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Configure GET/POST handlers
// GET handler for index /animals/ <<landing/root page of my sections
const pageSize = 4;
router.get('/', IsLoggedIn, logMiddleware, async (req, res, next) => {
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
    const animals = await Animal.find(query)
      .sort({ name: 1 })
      .limit(pageSize)
      .skip(skipSize);
    const totalRecords = await Animal.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / pageSize);
    res.render("animals", {
      title: "Animal Dataset",
      user: req.user,
      dataset: animals,
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
router.post("/add", IsLoggedIn, upload.single('image'), (req, res, next) => {
  // Use req.file.path to get the path of the uploaded image
  var imagePath = req.file.path;
  imagePath = path.basename(imagePath);
  console.log(imagePath); // Print the path of the uploaded image to the console)

  // Create a new Animal with the uploaded image path
  Animal.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: imagePath, // Save the path to the uploaded image
  })
    .then((createdModel) => {
      console.log("Model created successfully:", createdModel);
      res.redirect("/animals");
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
});

//TODO C > Create new animal
//GET handler for /animals/add (loads)
router.get("/add", IsLoggedIn, logMiddleware, (req, res, next) => {
  res.render("animals/add", { user: req.user, title: "Add a new Animal" });
});

//POST handler for /animals/add (receives input data)
router.post("/add", (req, res, next) => {
  Animal.create(
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: req.body.image,
    }, //new animal to add
    (err, newAnimal) => {
      res.redirect("/animals");
    } // callback function
  );
});


router.get("/edit/:_id", IsLoggedIn, logMiddleware, async  (req, res, next) => {
  try {
    const animalObj = await Animal.findById(req.params._id).exec();
    console.log(animalObj);
    res.render("animals/edit", {
      user: req.user,
      title: "Edit a Animal Entry",
      animal: animalObj
      //user: req.user,
    });
  } catch (err) {
    console.error(err);
    // Handle the error appropriately
  }
});

// POST /animals/editID
router.post("/edit/:_id", IsLoggedIn, upload.single('image'), (req, res, next) => {
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
  Animal.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: imagePath,
    }
  )
    .then((updatedAnimal) => {
      res.redirect("/animals");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});


//TODO D > Delete a animal
// GET /animals/delete/652f1cb7740320402d9ba04d
router.get("/delete/:_id", IsLoggedIn, (req, res, next) => {
  let animalId = req.params._id;
  Animal.deleteOne({ _id: animalId })
    .then(() => {
      res.redirect("/animals");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

// Export this router module
module.exports = router;