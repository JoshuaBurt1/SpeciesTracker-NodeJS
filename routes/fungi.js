const express = require("express");
const router = express.Router();
const Fungus = require("../models/fungus");

// GET /hosting/
router.get("/", (req, res, next) => {
  res.render("fungi/index", { title: "Fungi Index" });
});

// Export this router module
module.exports = router;
