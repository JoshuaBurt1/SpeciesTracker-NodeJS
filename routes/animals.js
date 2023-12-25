// Import express and create a router object
const express = require("express");
const multer = require('multer');
const path = require('path');
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const Animal = require("../models/animal"); // Import mongoose model to be used

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/animal_images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

//Configure GET/POST handlers
//GET handler for index /animals/ <<landing/root page of my section
//R > Retrieve/Read usually shows a list (filtered/unfiltered)
router.get("/", logMiddleware, (req, res, next) => {
  //res.render("animals/index", { title: "Animal Tracker" });
  //renders data in table
  Animal.find() //sorting function (alphabetically)
    .then((animals) => {
      res.render("animals/index", {
        title: "Animal Tracker Dataset",
        dataset: animals,
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

  // Create a new Animal with the uploaded image path
  Animal.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: imagePath, // Save the path to the uploaded image
    link: req.body.link,
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
router.get("/add", logMiddleware, (req, res, next) => {
  res.render("animals/add", { title: "Add a new Animal" });
});

//POST handler for /animals/add (receives input data)
router.post("/add", (req, res, next) => {
  Animal.create(
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: req.body.image,
      link: req.body.link,
    }, //new animal to add
    (err, newAnimal) => {
      res.redirect("/animals");
    } // callback function
  );
});


router.get("/edit/:_id", logMiddleware, async  (req, res, next) => {
  try {
    const animalObj = await Animal.findById(req.params._id).exec();
    console.log(animalObj);
    res.render("animals/edit", {
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
  Animal.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: imagePath,
      link: req.body.link,
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
router.get("/delete/:_id", (req, res, next) => {
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