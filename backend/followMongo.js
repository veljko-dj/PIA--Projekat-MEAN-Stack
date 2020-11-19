const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { strict } = require("assert");

const followSchema = mongoose.Schema({
  idUserFrom: { type: String },
  usernameFrom: {type: String},
  idUserTo: { type: String },
  usernameTo: {type: String}
});

followSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Follow", followSchema)
