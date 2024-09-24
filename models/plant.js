// Import mongoose
const mongoose = require("mongoose");

// Create schema definition object using mapping notation
const plantsSchemaObj = {
  // add each element and its properties
  // note: changing updateDate type to String = 2010-10-10 format)
  kingdom: { type: String, required: true, default: "plantae" },
  name: { type: String, required: true },
  binomialNomenclature: { type: String, required: true },
  updateDate: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, //this is used for user profile "stickers/rewards" & removeFlag if userVeracity # < than threshold
  dateChanged: { type: Number, required: false }, //array to keep track of edits (data integrity metric, user veracity metric), if null: higher data integrity & user veracity 
  locationChanged: { type: Number, required: false }, //array to keep track of edits (data integrity metric, user veracity metric), if null: higher data integrity & user veracity
  //note: exif metadata (date and location) of the image is not changed, it is only the shown data in mongoDB, the table, and csv.
  nameChanged: [{ //array of dictionary entries to keep track of edits (species metric), if not 0 => ++ due to poor picture, new species, image identifier updated)
    name: { type: String, required: false }, // The new name 
    changeCount: { type: Number, required: false, default: 0 } // Count starting at 0;
  }],
  //Use case - the name changes in 2 scenarios
  //1. Admin: during bulk upload to reprocess photos (new identifier model) => if same name : changecount not updated (image identifier solidity metric)
  //2. User: edits name (this should be from a given larger list compared to top 4 in add) => (user veracity/expertise metric)
  removalFlag: { type: Number, required: false, default: 0}, //If 0 : valid object; if 1 : invalid object (not shown in dataviewer) as user (userId) with veracity value < threshold
};

// Create new mongoose schema using the definition object
var plantsSchema = new mongoose.Schema(plantsSchemaObj);

// Create new mongoose model using the schema object and
// Import new model > provide name and schema
module.exports = mongoose.model("Plant", plantsSchema);
// alternative > module.exports = mongoose.model('Plant', plantsSchema);

//note: naming convention > models are singular, routers are plural
