//Model represents courses in my database
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
var dataSchemaObj = {
  username: { type: String },
  password: { type: String }, //Always encrypt pass word, never save as plain text
  oauthId: {type: String}, //id value to identify this user in the third-party system
  oauthProvider: {type: String}, //what auth provider was used?
  created: {type: Date}, //keeps track of when user was created
};
var usersSchema = new mongoose.Schema(dataSchemaObj);
// what about serialize? deserialize? password encryption? Use PLM plugin
usersSchema.plugin(plm);
module.exports = mongoose.model("User", usersSchema);

//note: naming convention > models are singular, routers are plural
