const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

var dataSchemaObj = {
  username: { type: String }, 
  email: { type: String },
  password: { type: String }, // Always encrypt password, never save as plain text
  oauthId: { type: String }, // id value to identify this user in the third-party system
  oauthProvider: { type: String }, // what auth provider was used?
  created: { type: Date }, // keeps track of when the user was created
  admin: { type: Number, default: 0 }, // Set default value to 0 if admin field is not provided
  userVeracity: {type: Number, default: 100.0}, // default user veracity value (calculated by: dateChanged*n, locationChanged*n, nameChanged*n, locationOutlier*n)
};

var usersSchema = new mongoose.Schema(dataSchemaObj);

// What about serialize? deserialize? password encryption? Use PLM plugin
usersSchema.plugin(plm);

module.exports = mongoose.model("User", usersSchema);