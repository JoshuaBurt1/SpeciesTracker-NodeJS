const express = require("express");
const router = express.Router();
//const Animal = require("../models/animal");
var logMiddleware = require('../logMiddleware'); //route logging middleware

// GET /hosting/
router.get("/", logMiddleware, (req, res, next) => {
  res.render("animals/index", { title: "Animals Index" });
});

// Export this router module
module.exports = router;
