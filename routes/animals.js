// Import express and create a router object
const express = require("express");
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const Animal = require("../models/animal"); // Import mongoose model to be used

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

//POST handler (save button action)
router.post("/add", (req, res, next) => {
  //res.redirect("/animals");
  //use the animal module to save data to DB
  Animal.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: req.body.image,
    link: req.body.link,
  })
    .then((createdModel) => {
      console.log("Model created successfully:", createdModel);
      // We can show a successful message by redirecting them to index
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
router.post("/edit/:_id", (req, res, next) => {
  Animal.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: req.body.image,
      link: req.body.link
    }
  )
    .then((updatedAnimal) => {
      res.redirect("/animals");
    })
    .catch((err) => {
      // handle any potential errors here
      // For example, you can redirect to an error page
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