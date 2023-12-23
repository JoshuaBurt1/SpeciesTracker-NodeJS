// Import mongoose
const mongoose = require("mongoose");

// Create schema definition object using mapping notation
const animalsSchemaObj = {
  // add each element and its properties
  // note: changing updateDate type to String = 2010-10-10 format)
  name: { type: String, required: true },
  updateDate: { type: Date, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String},
};

// Create new mongoose schema using the definition object
var animalsSchema = new mongoose.Schema(animalsSchemaObj);

// Create new mongoose model using the schema object and
// Import new model > provide name and schema
module.exports = mongoose.model("Animal", animalsSchema);

// alternative > module.exports = mongoose.model('Plant', plantsSchema);

//note: naming convention > models are singular, routers are plural
