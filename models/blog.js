// Import mongoose
const mongoose = require("mongoose");

const blogSchemaObj = new mongoose.Schema(
  {
    title: { type: String, required: true  },
    content: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  }
);

// Create new mongoose schema using the definition object
const blogSchema = new mongoose.Schema(blogSchemaObj, {
  timestamps: true
});

// Create new mongoose model using the schema object
module.exports = mongoose.model("Blog", blogSchema);