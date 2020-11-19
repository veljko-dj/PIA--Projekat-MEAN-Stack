const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const bookSchema = mongoose.Schema({
  title: { type: String },
  photoURL: { type: String },
  authors: { type: String },
  date: { type: String },
  genre: { type: String  },
  description: { type: String },
  rate: { type: String },
  numOfRate: {type: String},
  valid: { type: String },
});

bookSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Book", bookSchema);
