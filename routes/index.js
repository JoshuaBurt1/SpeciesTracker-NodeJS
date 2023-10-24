var express = require('express');
var router = express.Router();

/* GET handlers */
//homepage
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Species Tracker' });
});

// taxonomic rank
router.get("/animals/index", (req, res, next) => {
  res.render("index", { title: "Animals", });
});
router.get("fungi/index", (req, res, next) => {
  res.render("index", { title: "Fungi", });
});
router.get("/plants/index", (req, res, next) => {
  res.render("index", { title: "Plants", });
});
router.get("/protists/index", (req, res, next) => {
  res.render("index", { title: "Protists" });
});

//additional features
router.get("/forum", (req, res, next) => {
  res.render("forum", { title: "Forum" });
});
router.get("/identification", (req, res, next) => {
  res.render("identification", { title: "Identification" });
});

module.exports = router;
