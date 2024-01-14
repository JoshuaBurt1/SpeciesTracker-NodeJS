// Import express and create a router object
const express = require("express");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const IsLoggedIn = require("../extensions/authentication");

//Mongoose models
const Plant = require("../models/plant"); // Import mongoose model to be used

//FILE STORAGE (multer)
// Update the storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user._id; // Assuming user object is available after authentication
    const userImagesPath = `public/images/plantae_images`;
    fs.mkdirSync(path.join(__dirname, '..', userImagesPath), { recursive: true });
    cb(null, userImagesPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Use the middleware to check if the user is logged in
router.use(IsLoggedIn);

// Configure GET/POST handlers
// GET handler for index /plants/ <<landing/root page of my sections
const pageSize = 4;
router.get('/', IsLoggedIn, logMiddleware, async (req, res, next) => {
  try {
    // SearchBar query parameter
    let searchQuery = req.query.searchBar || '';
    const userId = req.user._id;

    // Use a case-insensitive regular expression to match part of the name
    let query = {
      name: { $regex: new RegExp(searchQuery, 'i') },
      user: userId, // Include user ID in the search criteria
    };

    let page = parseInt(req.query.page) || 1;
    let skipSize = pageSize * (page - 1);
    
    const plants = await Plant.find(query)
      .sort({ name: 1 })
      .limit(pageSize)
      .skip(skipSize);

    const totalRecords = await Plant.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / pageSize);

    res.render("plants", {
      title: "Plant Dataset",
      user: req.user,
      dataset: plants,
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

  // Create a new Plant with the uploaded image path
  Plant.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: imagePath, // Save the path to the uploaded image
    user: req.user._id, // Use req.user._id to get the currently logged-in user's ID
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
router.get("/add", IsLoggedIn, logMiddleware, (req, res, next) => {
  res.render("plants/add", { user: req.user, title: "Add a new Plant" });
});

router.get("/edit/:_id", IsLoggedIn, logMiddleware, async  (req, res, next) => {
  try {
    const plantObj = await Plant.findById(req.params._id).exec();
    console.log(plantObj);
    res.render("plants/edit", {
      user: req.user,
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
  Plant.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: imagePath,
      user: req.user._id, // Use req.user._id to get the currently logged-in user's ID
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
router.get("/delete/:_id", IsLoggedIn, async (req, res, next) => {
  try {
    let plantId = req.params._id;

    // Find the plant to be deleted
    const plantToDelete = await Plant.findById(plantId).exec();

    // Delete the image file associated with the plant
    if (plantToDelete && plantToDelete.image) {
      const imagePath = path.join(__dirname, '..', 'public/images/plantae_images', plantToDelete.image);

      try {
        // Check if the file exists before attempting to delete
        await fsPromises.access(imagePath);

        // If the file exists, delete it
        await fsPromises.unlink(imagePath);
      } catch (err) {
        // Handle the error (file not found, permission issues, etc.)
        console.error(`Error deleting image file: ${err.message}`);
      }
    }

    // Delete the plant from the database
    await Plant.deleteOne({ _id: plantId });

    res.redirect("/plants");
  } catch (err) {
    console.error(err);
    res.redirect("/error");
  }
});

// Export this router module
module.exports = router;  