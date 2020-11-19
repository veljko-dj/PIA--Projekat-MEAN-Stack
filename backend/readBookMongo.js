const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const readBookSchema = mongoose.Schema({
  idUser: { type: String },
  idBook: { type: String },
  type: { type: String },
  title: { type: String },
  authors: { type: String },
  genre: {type: String}
});

readBookSchema.plugin(uniqueValidator);

module.exports = mongoose.model("ReadBook", readBookSchema);
