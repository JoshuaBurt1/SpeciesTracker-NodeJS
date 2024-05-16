// Import mongoose
const mongoose = require("mongoose");

// Create schema definition object using mapping notation
const plantsSchemaObj = {
  // add each element and its properties
  // note: changing updateDate type to String = 2010-10-10 format)
  kingdom: { type: String, required: true, default: "plantae" },
  name: { type: String, required: true },
  binomialNomenclature: { type: String, required: false },
  updateDate: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dateChanged: { type: Number, required: false }, //array to keep track of edits (data integrity metric), if null: higher data integrity
  locationChanged: { type: Number, required: false }, //array to keep track of edits (data integrity metric), if null: higher data integrity
  //nameChanged: { type: Array, required: false }, //array to keep track of edits (species metric), if not null (poor picture, new species, image identifier updated)
  //note: exif metadata of the image is not changed, it is only the shown data in mongoDB, the table, and csv.
};

// Create new mongoose schema using the definition object
var plantsSchema = new mongoose.Schema(plantsSchemaObj);

// Create index for the 'name' field
plantsSchema.index({ name: 1 });

// Create new mongoose model using the schema object and
// Import new model > provide name and schema
module.exports = mongoose.model("Plant", plantsSchema);
// alternative > module.exports = mongoose.model('Plant', plantsSchema);

//note: naming convention > models are singular, routers are plural
