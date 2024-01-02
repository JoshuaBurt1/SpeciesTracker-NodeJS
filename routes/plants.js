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

//Configure GET/POST handlers
const pageSize = 4;
router.get('/', logMiddleware, async (req, res, next) => {
    try {
        // create variable for storing page number
        // extract value from query string
        // Expected ?page=1
        let page = parseInt(req.query.page) || 1; // default to page 1 
        // calculate how many records to skip
        // page 1 shows records 1 to 10 so skip 0
        // page 2 shows records 11 to 20 so skip 10
        let skipSize = pageSize * (page - 1);

        // Modify find() to accept query
        const plants = await Plant.find()
            // implement pagination
            .sort({ name: 1 }) // to achieve a consistent result, sort by name A to Z
            .limit(pageSize) // set page size limit
            .skip(skipSize);
        // Count total number of records for pagination
        const totalRecords = await Plant.countDocuments();

        const totalPages = Math.ceil(totalRecords / pageSize);

        res.render("plants/index", {
            title: "Plant Dataset",
            dataset: plants,
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


  // Create a new Plant with the uploaded image path
  Plant.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: imagePath, // Save the path to the uploaded image
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

//POST handler for /plants/add (receives input data)
router.post("/add", (req, res, next) => {
  Plant.create(
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: req.body.image,
    }, //new plant to add
    (err, newPlant) => {
      res.redirect("/plants");
    } // callback function
  );
});


router.get("/edit/:_id", logMiddleware, async  (req, res, next) => {
  try {
    const animalObj = await Plant.findById(req.params._id).exec();
    console.log(animalObj);
    res.render("plants/edit", {
      title: "Edit a Plant Entry",
      plant: animalObj
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
    }
  )
    .then((updatedAnimal) => {
      res.redirect("/plants");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});


//TODO D > Delete a plant
// GET /plants/delete/652f1cb7740320402d9ba04d
router.get("/delete/:_id", (req, res, next) => {
  let animalId = req.params._id;
  Plant.deleteOne({ _id: animalId })
    .then(() => {
      res.redirect("/plants");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

// Export this router module
module.exports = router;