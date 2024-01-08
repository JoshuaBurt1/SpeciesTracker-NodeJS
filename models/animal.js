// Import mongoose
const mongoose = require("mongoose");

// Create schema definition object using mapping notation
const animalsSchemaObj = {
  // add each element and its properties
  kingdom: { type: String, required: true, default: "animalia" },
  name: { type: String, required: true },
  updateDate: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
};

// Create new mongoose schema using the definition object
var animalsSchema = new mongoose.Schema(animalsSchemaObj);

// Create index for the 'name' field
animalsSchema.index({ name: 1 });

// Create new mongoose model using the schema object
module.exports = mongoose.model("Animal", animalsSchema);
