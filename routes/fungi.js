// Import express and create a router object
const express = require("express");
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const Fungus = require("../models/fungus"); // Import mongoose model to be used

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
router.get("/", logMiddleware, (req, res, next) => {
  //res.render("fungis/index", { title: "Fungus Tracker" });
  //renders data in table
  Fungus.find() //sorting function (alphabetically)
    .then((fungi) => {
      res.render("fungi/index", {
        title: "Fungi Tracker Dataset",
        dataset: fungi,
        //user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//POST handler (save button action)
router.post("/add", (req, res, next) => {
  //res.redirect("/fungi");
  //use the fungus module to save data to DB
  Fungus.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: req.body.image,
    link: req.body.link,
  })
    .then((createdModel) => {
      console.log("Model created successfully:", createdModel);
      // We can show a successful message by redirecting them to index
      res.redirect("/fungi");
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
});

//TODO C > Create new fungus
//GET handler for /fungi/add (loads)
router.get("/add", logMiddleware, (req, res, next) => {
  res.render("fungi/add", { title: "Add a new Fungus" });
});

//POST handler for /fungi/add (receives input data)
router.post("/add", (req, res, next) => {
  Fungus.create(
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: req.body.image,
      link: req.body.link,
    }, //new fungus to add
    (err, newFungus) => {
      res.redirect("/fungi");
    } // callback function
  );
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
router.post("/edit/:_id", (req, res, next) => {
  Fungus.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: req.body.image,
      link: req.body.link
    }
  )
    .then((updatedFungus) => {
      res.redirect("/fungi");
    })
    .catch((err) => {
      // handle any potential errors here
      // For example, you can redirect to an error page
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