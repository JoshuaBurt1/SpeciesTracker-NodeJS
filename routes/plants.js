// Import express and create a router object
const express = require("express");
const router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware
const Plant = require("../models/plant"); // Import mongoose model to be used

// add reusable middleware function to inject it in our handlers below that need authorization
//   1. prevents non-logged in viewer from seeing add button in plants
//   2. does not stop non-logged in viewer from entering URL to view: 
//   http://localhost:3000/Plants/add
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
//GET handler for index /plants/ <<landing/root page of my section
//R > Retrieve/Read usually shows a list (filtered/unfiltered)
router.get("/", logMiddleware, (req, res, next) => {
  //res.render("plants/index", { title: "Plant Tracker" });
  //renders data in table
  Plant.find() //sorting function (alphabetically)
    .then((plants) => {
      res.render("plants/index", {
        title: "Plant Tracker Dataset",
        dataset: plants,
        //user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

//note: NEED TO COMBINE THESE 2 FUNCTIONS TO RENDER ASYNCHRONOUSLY (see below)
//GET handler for index /plants/add
//router.get("/add", (req, res, next) => {
//  res.render("plants/add", { title: "Add a New Plant" });
  // Language.find()
  //   .then((languageList) => {
  //     res.render("plants/add", {
  //       title: "Add a new Plant",
  //       languages: languageList,
  //       //user: req.user,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
//});
// //GET handler for index /plants/add
// router.get("/add", (req, res, next) => {
//   //res.render("plants/add", { title: "Add a New Plant" });
//   Host.find()
//     .then((hostList) => {
//       res.render("plants/add", {
//         title: "Add a new Plant",
//         hosting: hostList,
//         user: req.user,
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

//router.get("/add", async (req, res, next) => {
//  res.render("plant/add", { title: "Add Plant" });
  // try {
  //   const [languageList, hostList] = await Promise.all([
  //     Language.find().exec(),
  //     Host.find().exec(),
  //   ]);
  //   res.render("plants/add", {
  //     title: "Add a new Plant Entry",
  //     //user: req.user,
  //   });
  // } catch (err) {
  //   console.log(err);
  //   // Handle the error appropriately
  // }
//});

//POST handler (save button action)
router.post("/add", (req, res, next) => {
  //res.redirect("/plants");
  //use the plant module to save data to DB
  Plant.create({
    name: req.body.name,
    updateDate: req.body.updateDate,
    location: req.body.location,
    image: req.body.image,
    link: req.body.link,
  })
    .then((createdModel) => {
      console.log("Model created successfully:", createdModel);
      // We can show a successful message by redirecting them to index
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
      link: req.body.link,
    }, //new plant to add
    (err, newPlant) => {
      res.redirect("/plants");
    } // callback function
  );
});

//note: NEED TO COMBINE THESE 2 FUNCTIONS TO RENDER ASYNCHRONOUSLY (see below)
//TODO U > Update given plant
//GET /plants/edit/ID
router.get("/edit/:_id", logMiddleware, (req, res, next) => {
  res.render("plants/edit", {
    title: "Edit a Plant",
    //plant: plantObj,
    //languages: languageList,
    //user: req.user,
  });

  // Plant.findById(req.params._id)
  //   .then((plantObj) =>
  //     Language.find().then((languageList) => ({ plantObj, languageList }))
  //   )
  //   .then(({ plantObj, languageList }) => {
  //     res.render("plants/edit", {
  //       title: "Edit a Plant",
  //       plant: plantObj,
  //       //languages: languageList,
  //       //user: req.user,
  //     });
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });
});
// // GET /plants/edit/ID
// router.get("/edit/:_id", (req, res, next) => {
//   Plant.findById(req.params._id)
//     .then((plantObj) =>
//       Host.find().then((hostList) => ({ plantObj, hostList }))
//     )
//     .then(({ plantObj, hostList }) => {
//       res.render("plants/edit", {
//         title: "Edit a Plant",
//         plant: plantObj,
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
//     const plantObj = await Plant.findById(req.params._id).exec();
//     const [languageList, hostList] = await Promise.all([
//       Language.find().exec(),
//       Host.find().exec(),
//     ]);
//     res.render("plants/edit", {
//       title: "Edit a Plant Entry",
//       plant: plantObj
//       //user: req.user,
//     });
//   } catch (err) {
//     console.error(err);
//     // Handle the error appropriately
//   }
// });

// POST /plants/editID
router.post("/edit/:_id", (req, res, next) => {
  Plant.findOneAndUpdate(
    { _id: req.params._id },
    {
      name: req.body.name,
      updateDate: req.body.updateDate,
      location: req.body.location,
      image: req.body.image,
      link: req.body.link
    }
  )
    .then((updatedPlant) => {
      res.redirect("/plants");
    })
    .catch((err) => {
      // handle any potential errors here
      // For example, you can redirect to an error page
      res.redirect("/error");
    });
});

//TODO D > Delete a plant
// GET /plants/delete/652f1cb7740320402d9ba04d
router.get("/delete/:_id", (req, res, next) => {
  let plantId = req.params._id;
  Plant.deleteOne({ _id: plantId })
    .then(() => {
      res.redirect("/plants");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

// Export this router module
module.exports = router;
