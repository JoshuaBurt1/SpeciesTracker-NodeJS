// Import mongoose
const mongoose = require("mongoose");

// Create schema definition object using mapping notation
const blogSchemaObj = {
  title: { type: String },
  content: { type: String, required: false },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED'],
    default: 'DRAFT'
  }
};

// Create new mongoose schema using the definition object
const blogSchema = new mongoose.Schema(blogSchemaObj, {
  timestamps: true
});

// Create new mongoose model using the schema object
module.exports = mongoose.model("Blog", blogSchema);