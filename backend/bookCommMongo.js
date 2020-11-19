const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { strict } = require("assert");

const bookCommSchema = mongoose.Schema({
  idUser: { type: String },
  idBook: { type: String },
  comment: { type: String },
  rate: {type: String},
  username: {type : String},
  authors: {type : String},
  title: {type : String}
});

bookCommSchema.plugin(uniqueValidator);

module.exports = mongoose.model("BookComm", bookCommSchema)
