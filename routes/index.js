var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Species Tracker' });
});

// GET handler for /about
router.get("/animals/index", (req, res, next) => {
  res.render("index", { title: "Animals", });
});
// GET handler for /projects/index
router.get("fungi/index", (req, res, next) => {
  res.render("index", { title: "Fungi", });
});
// GET handler for /projects/index
router.get("/plants/index", (req, res, next) => {
  res.render("index", { title: "Plants", });
});
// GET handler for /contacts
router.get("/protists/index", (req, res, next) => {
  res.render("index", { title: "Protists" });
});

// GET handler for /contacts
router.get("/forum", (req, res, next) => {
  res.render("forum", { title: "Forum" });
});



module.exports = router;
