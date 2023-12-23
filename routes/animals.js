// Import express and create a router object
const express = require("express");
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const Animal = require("../models/animal"); // Import mongoose model to be used

// add reusable middleware function to inject it in our handlers below that need authorization
//   1. prevents non-logged in viewer from seeing add button in animals
//   2. does not stop non-logged in viewer from entering URL to view: 
//   http://localhost:3000/Animals/add
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

//note: NEED TO COMBINE THESE 2 FUNCTIONS TO RENDER ASYNCHRONOUSLY (see below)
//GET handler for index /animals/add
//router.get("/add", (req, res, next) => {
//  res.render("animals/add", { title: "Add a New Animal" });
  // Language.find()
  //   .then((languageList) => {
  //     res.render("animals/add", {
  //       title: "Add a new Animal",
  //       languages: languageList,
  //       //user: req.user,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
//});
// //GET handler for index /animals/add
// router.get("/add", (req, res, next) => {
//   //res.render("animals/add", { title: "Add a New Animal" });
//   Host.find()
//     .then((hostList) => {
//       res.render("animals/add", {
//         title: "Add a new Animal",
//         hosting: hostList,
//         user: req.user,
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

//router.get("/add", async (req, res, next) => {
//  res.render("animals/add", { title: "Add Animal" });
  // try {
  //   const [languageList, hostList] = await Promise.all([
  //     Language.find().exec(),
  //     Host.find().exec(),
  //   ]);
  //   res.render("animals/add", {
  //     title: "Add a new Animal Entry",
  //     //user: req.user,
  //   });
  // } catch (err) {
  //   console.log(err);
  //   // Handle the error appropriately
  // }
//});

//POST handler (save button action)
router.post("/add", (req, res, next) => {
  //res.redirect("/animals");
  //use the animal module to save data to DB
  Animal.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
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

//note: NEED TO COMBINE THESE 2 FUNCTIONS TO RENDER ASYNCHRONOUSLY (see below)
//TODO U > Update given animal
//GET /animals/edit/ID
router.get("/edit/:_id", logMiddleware, (req, res, next) => {
  res.render("animals/edit", {
    title: "Edit a Animal",
    //animal: animalObj,
    //languages: languageList,
    //user: req.user,
  });

  // Animal.findById(req.params._id)
  //   .then((animalObj) =>
  //     Language.find().then((languageList) => ({ animalObj, languageList }))
  //   )
  //   .then(({ animalObj, languageList }) => {
  //     res.render("animals/edit", {
  //       title: "Edit a Animal",
  //       animal: animalObj,
  //       //languages: languageList,
  //       //user: req.user,
  //     });
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });
});
// // GET /animals/edit/ID
// router.get("/edit/:_id", (req, res, next) => {
//   Animal.findById(req.params._id)
//     .then((animalObj) =>
//       Host.find().then((hostList) => ({ animalObj, hostList }))
//     )
//     .then(({ animalObj, hostList }) => {
//       res.render("animals/edit", {
//         title: "Edit a Animal",
//         animal: animalObj,
//         hosting: hostList,
//         user: req.user,
//       });
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// });

// router.get("/edit/:_id", async (req, res, next) => {
//   try {
//     const animalObj = await Animal.findById(req.params._id).exec();
//     const [languageList, hostList] = await Promise.all([
//       Language.find().exec(),
//       Host.find().exec(),
//     ]);
//     res.render("animals/edit", {
//       title: "Edit a Animal Entry",
//       animal: animalObj
//       //user: req.user,
//     });
//   } catch (err) {
//     console.error(err);
//     // Handle the error appropriately
//   }
// });

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