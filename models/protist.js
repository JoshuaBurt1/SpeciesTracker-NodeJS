//Model represents hosting in my database
const mongoose = require("mongoose");
const protistsSchemaObj = {
  name: { type: String, required: true },
};
var protistsSchema = new mongoose.Schema(protistsSchemaObj);
module.exports = mongoose.model("Protist", protistsSchema);

//note: naming convention > models are singular, routers are plural
