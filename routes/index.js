var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Species Tracker' });
});

router.get('/post', function(req, res, next) {
  res.render('post', { title: 'Post' });
});

// GET handler for /about
router.get("/page_animalia", (req, res, next) => {
  res.render("page_animalia", { title: "Animals", });
});
// GET handler for /projects/index
router.get("/page_fungi", (req, res, next) => {
  res.render("page_fungi", { title: "Fungi", });
});
// GET handler for /contacts
router.get("/page_plantae", (req, res, next) => {
  res.render("page_plantae", { title: "Plants" });
});
// GET handler for /contacts
router.get("/page_protista", (req, res, next) => {
  res.render("page_protista", { title: "Protists" });
});


module.exports = router;
