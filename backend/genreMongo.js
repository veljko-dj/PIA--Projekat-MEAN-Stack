const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const genreSchema = mongoose.Schema({
  name: { type: String }
});

genreSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Genre", genreSchema);
