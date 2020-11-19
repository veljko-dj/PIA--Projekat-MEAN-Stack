const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { strict } = require("assert");

const eventSchema = mongoose.Schema({
  name: { type: String },
  dateStart: { type: String },
  dateEnd: { type: String },
  description: { type: String },
  public: { type: String },
  guests: { type: String },
  valid: { type: String },
  active: { type: String }
});

eventSchema.plugin(uniqueValidator);

module.exports = mongoose.model("event", eventSchema)
