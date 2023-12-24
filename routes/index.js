var express = require('express');
var router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware


/* GET handlers */
//homepage
router.get('/', logMiddleware, function(req, res, next) {
  res.render('index', { title: 'Species Tracker' });
});

// SINCE app.js HAS A ROUTE -> UNNEEDED
// router.get("/animals/index", (req, res, next) => {
//   res.render("index", { title: "Animals", });
// });
// router.get("fungi/index", (req, res, next) => {
//   res.render("index", { title: "Fungi", });
// });
// router.get("/plants/index", (req, res, next) => {
//   res.render("index", { title: "Plants", });
// });
// router.get("/protists/index", (req, res, next) => {
//   res.render("index", { title: "Protists" });
// });

//SINCE app.js DOES NOT HAVE A ROUTE -> NECESSARY
//okay for single pages without routes themselves
router.get("/forum", logMiddleware, (req, res, next) => {
  res.render("forum", { title: "Forum" });
});
router.get("/identification", logMiddleware,  (req, res, next) => {
  res.render("identification", { title: "Identification" });
});

router.get("/error", logMiddleware,  (req, res, next) => {
  res.render("error", { title: "Error" });
});


module.exports = router;