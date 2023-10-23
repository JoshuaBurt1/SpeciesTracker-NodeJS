//Model represents languages in my database
const mongoose = require("mongoose");
const languageSchemaObj = {
  name: { type: String, required: true },
  framework: { type: String, required: true },
};
var languagesSchema = new mongoose.Schema(languageSchemaObj);
module.exports = mongoose.model("Language", languagesSchema);

//note: naming convention > models are singular, routers are plural
