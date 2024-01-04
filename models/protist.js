// Import mongoose
const mongoose = require("mongoose");

// Create schema definition object using mapping notation
const protistsSchemaObj = {
  // add each element and its properties
  // note: changing updateDate type to String = 2010-10-10 format)
  kingdom: { type: String, required: true, default: "protista" },
  name: { type: String, required: true },
  updateDate: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
};

// Create new mongoose schema using the definition object
var protistsSchema = new mongoose.Schema(protistsSchemaObj);

// Create new mongoose model using the schema object and
// Import new model > provide name and schema
module.exports = mongoose.model("Protist", protistsSchema);
// alternative > module.exports = mongoose.model('Plant', plantsSchema);

//note: naming convention > models are singular, routers are plural
