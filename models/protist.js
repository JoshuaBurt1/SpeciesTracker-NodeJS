// Import mongoose
const mongoose = require("mongoose");

// Create schema definition object using mapping notation
const protistsSchemaObj = {
  kingdom: { type: String, required: true, default: "protista" },
  name: { type: String, required: true },
  binomialNomenclature: { type: String, required: false },
  updateDate: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dateChanged: { type: Number, required: false }, //array to keep track of edits (data integrity metric), if null: higher data integrity
  locationChanged: { type: Number, required: false }, //array to keep track of edits (data integrity metric), if null: higher data integrity
  //nameChanged: { type: Array, required: false },
};

// Create new mongoose schema using the definition object
var protistsSchema = new mongoose.Schema(protistsSchemaObj);

// Create index for the 'name' field
protistsSchema.index({ name: 1 });

// Create new mongoose model using the schema object and
// Import new model > provide name and schema
module.exports = mongoose.model("Protist", protistsSchema);
// alternative > module.exports = mongoose.model('Plant', plantsSchema);

//note: naming convention > models are singular, routers are plural
