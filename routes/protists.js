const express = require("express");
const router = express.Router();
const Fungus = require("../models/protist");

// GET /hosting/
router.get("/", (req, res, next) => {
  res.render("protists/index", { title: "Protists Index" });
});

// Export this router module
module.exports = router;
