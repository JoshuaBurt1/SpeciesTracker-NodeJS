//Model represents hosting in my database
const mongoose = require("mongoose");
const hostSchemaObj = {
  name: { type: String, required: true },
};
var hostingSchema = new mongoose.Schema(hostSchemaObj);
module.exports = mongoose.model("Host", hostingSchema);

//note: naming convention > models are singular, routers are plural
