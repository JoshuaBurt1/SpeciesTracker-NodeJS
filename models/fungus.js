//Model represents hosting in my database
const mongoose = require("mongoose");
const fungiSchemaObj = {
  name: { type: String, required: true },
};
var fungiSchema = new mongoose.Schema(fungiSchemaObj);
module.exports = mongoose.model("Fungus", fungiSchema);

//note: naming convention > models are singular, routers are plural
