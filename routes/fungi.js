// Import express and create a router object
const express = require("express");
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const Fungus = require("../models/fungus"); // Import mongoose model to be used

// add reusable middleware function to inject it in our handlers below that need authorization
//   1. prevents non-logged in viewer from seeing add button in fungus
//   2. does not stop non-logged in viewer from entering URL to view: 
//   http://localhost:3000/Fungis/add
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

//note: NEED TO COMBINE THESE 2 FUNCTIONS TO RENDER ASYNCHRONOUSLY (see below)
//GET handler for index /fungi/add
//router.get("/add", (req, res, next) => {
//  res.render("fungi/add", { title: "Add a New Fungus" });
  // Language.find()
  //   .then((languageList) => {
  //     res.render("fungi/add", {
  //       title: "Add a new Fungus",
  //       languages: languageList,
  //       //user: req.user,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
//});
// //GET handler for index /fungi/add
// router.get("/add", (req, res, next) => {
//   //res.render("fungi/add", { title: "Add a New Fungus" });
//   Host.find()
//     .then((hostList) => {
//       res.render("fungi/add", {
//         title: "Add a new Fungus",
//         hosting: hostList,
//         user: req.user,
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

//router.get("/add", async (req, res, next) => {
//  res.render("fungus/add", { title: "Add Fungus" });
  // try {
  //   const [languageList, hostList] = await Promise.all([
  //     Language.find().exec(),
  //     Host.find().exec(),
  //   ]);
  //   res.render("fungi/add", {
  //     title: "Add a new Fungus Entry",
  //     //user: req.user,
  //   });
  // } catch (err) {
  //   console.log(err);
  //   // Handle the error appropriately
  // }
//});

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

//note: NEED TO COMBINE THESE 2 FUNCTIONS TO RENDER ASYNCHRONOUSLY (see below)
//TODO U > Update given fungus
//GET /fungi/edit/ID
router.get("/edit/:_id", logMiddleware, (req, res, next) => {
  res.render("fungi/edit", {
    title: "Edit a Fungus",
    //fungus: fungusObj,
    //languages: languageList,
    //user: req.user,
  });

  // Fungus.findById(req.params._id)
  //   .then((fungusObj) =>
  //     Language.find().then((languageList) => ({ fungusObj, languageList }))
  //   )
  //   .then(({ fungusObj, languageList }) => {
  //     res.render("fungi/edit", {
  //       title: "Edit a Fungus",
  //       fungus: fungusObj,
  //       //languages: languageList,
  //       //user: req.user,
  //     });
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });
});
// // GET /fungi/edit/ID
// router.get("/edit/:_id", (req, res, next) => {
//   Fungus.findById(req.params._id)
//     .then((fungusObj) =>
//       Host.find().then((hostList) => ({ fungusObj, hostList }))
//     )
//     .then(({ fungusObj, hostList }) => {
//       res.render("fungi/edit", {
//         title: "Edit a Fungus",
//         fungus: fungusObj,
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
//     const fungusObj = await Fungus.findById(req.params._id).exec();
//     const [languageList, hostList] = await Promise.all([
//       Language.find().exec(),
//       Host.find().exec(),
//     ]);
//     res.render("fungi/edit", {
//       title: "Edit a Fungus Entry",
//       fungus: fungusObj
//       //user: req.user,
//     });
//   } catch (err) {
//     console.error(err);
//     // Handle the error appropriately
//   }
// });

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