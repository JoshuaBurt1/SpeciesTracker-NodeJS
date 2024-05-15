// Import express and create a router object
const express = require("express");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const IsLoggedIn = require("../extensions/authentication");

//Mongoose models
const Bacterium = require("../models/bacterium"); // Import mongoose model to be used

//FILE STORAGE
// Update the storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user._id; // Assuming user object is available after authentication
    const userImagesPath = `public/images/bacteria_images`;

    // Ensure the user's folder exists, create if not
    fs.mkdirSync(path.join(__dirname, '..', userImagesPath), { recursive: true });

    // Set the destination path
    cb(null, userImagesPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
// Use the updated storage configuration
const upload = multer({ storage: storage });
// Use the middleware to check if the user is logged in
router.use(IsLoggedIn);

// Configure GET/POST handlers
// GET handler for index /bacteria/ <<landing/root page of my sections
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
    
    const bacteria = await Bacterium.find(query)
      .sort({ name: 1 })
      .limit(pageSize)
      .skip(skipSize);

    const totalRecords = await Bacterium.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / pageSize);

    res.render("bacteria", {
      title: "Bacterium Dataset",
      user: req.user,
      dataset: bacteria,
      searchQuery: searchQuery,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

//ADD name field = name_timestamp.jpg
const userImagesPath = 'public/images/bacteria_images';
// Ensure the directory exists
fs.mkdirSync(path.join(__dirname, '..', userImagesPath), { recursive: true });
const createUniqueImageName = (name, originalName) => {
  // Replace spaces with underscores in the name
  const formattedName = name.replace(/\s+/g, '_');
  const extension = path.extname(originalName);
  const timestamp = new Date().getTime();
  const uniqueName = `${formattedName}_${timestamp}${extension}`;
  return uniqueName;
};

//ADD view POST
router.post("/add", IsLoggedIn, upload.single('image'), async (req, res, next) => {
  // Use req.file.path to get the path of the uploaded image
  const uniqueImageName = createUniqueImageName(req.body.name, req.file.originalname);
    // Move the uploaded image to the new destination path
    const newDestinationPath = path.join(__dirname, '..', userImagesPath, uniqueImageName);
    await fs.promises.rename(req.file.path, newDestinationPath);

  // Create a new Bacterium with the uploaded image path
  Bacterium.create({
    name: req.body.name,
    binomialNomenclature: req.body.binomialNomenclature,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: uniqueImageName, // Save the path to the uploaded image
    user: req.user._id, // Use req.user._id to get the currently logged-in user's ID
  })
  .then((createdModel) => {
    console.log("Model created successfully:", createdModel);
    res.redirect("/bacteria");
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
});

//TODO C > Create new bacterium
//GET handler for /bacteria/add (loads)
router.get("/add", IsLoggedIn, logMiddleware, (req, res, next) => {
  res.render("bacteria/add", { user: req.user, title: "Add a new Bacterium" });
});

router.get("/edit/:_id", IsLoggedIn, logMiddleware, async  (req, res, next) => {
  try {
    const bacteriumObj = await Bacterium.findById(req.params._id).exec();
    console.log(bacteriumObj);
    res.render("bacteria/edit", {
      user: req.user,
      title: "Edit a Bacterium Entry",
      bacterium: bacteriumObj
      //user: req.user,
    });
  } catch (err) {
    console.error(err);
    // Handle the error appropriately
  }
});

// POST /bacteria/editID
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
  Bacterium.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      binomialNomenclature: req.body.binomialNomenclature,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: imagePath,
      user: req.user._id, // Use req.user._id to get the currently logged-in user's ID
    }
  )
  .then((updatedBacterium) => {
    res.redirect("/bacteria");
  })
  .catch((err) => {
    res.redirect("/error");
  });
});

//TODO D > Delete a bacterium
// GET /bacteria/delete/652f1cb7740320402d9ba04d
router.get("/delete/:_id", IsLoggedIn, async (req, res, next) => {
  try {
    let bacteriumId = req.params._id;
    
    // Find the bacterium to be deleted
    const bacteriumToDelete = await Bacterium.findById(bacteriumId).exec();

    // Delete the image file associated with the bacterium
    if (bacteriumToDelete && bacteriumToDelete.image) {
      const imagePath = path.join(__dirname, '..', 'public/images/bacteria_images', bacteriumToDelete.image);
      fs.unlinkSync(imagePath); // Delete the file
    }

    // Delete the bacterium from the database
    await Bacterium.deleteOne({ _id: bacteriumId });

    res.redirect("/bacteria");
  } catch (err) {
    console.error(err);
    res.redirect("/error");
  }
});

// Export this router module
module.exports = router;  