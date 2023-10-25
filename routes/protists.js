const express = require("express");
const router = express.Router();
//const Protist = require("../models/protist");
var logMiddleware = require('../logMiddleware'); //route logging middleware

// Middleware to log the current route for both GET and POST requests
// function logCurrentRoute(req, res, next) {
//   console.log('Current Route: ' + req.originalUrl);
//   next();
// }

// GET /hosting/
router.get("/", logMiddleware, (req, res, next) => {
  res.render("protists/index", { title: "Protists Index" });
});

// Export this router module
module.exports = router;
