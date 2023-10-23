//Model represents hosting in my database
const mongoose = require("mongoose");
const animalsSchemaObj = {
  name: { type: String, required: true },
};
var animalsSchema = new mongoose.Schema(animalsSchemaObj);
module.exports = mongoose.model("Animal", animalsSchema);

//note: naming convention > models are singular, routers are plural
