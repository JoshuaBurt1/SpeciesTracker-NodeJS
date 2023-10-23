const express = require("express");
const router = express.Router();
const Fungus = require("../models/animal");

// GET /hosting/
router.get("/", (req, res, next) => {
  res.render("animals/index", { title: "Animals Index" });
});

// Export this router module
module.exports = router;
