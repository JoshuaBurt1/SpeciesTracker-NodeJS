const express = require("express");
const router = express.Router();
//const Fungus = require("../models/fungus");
var logMiddleware = require('../logMiddleware'); //route logging middleware

// GET /hosting/
router.get("/", logMiddleware, (req, res, next) => {
  res.render("fungi/index", { title: "Fungi Index" });
});

// Export this router module
module.exports = router;
