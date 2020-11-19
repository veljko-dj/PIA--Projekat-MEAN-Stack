const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const onlineSchema = mongoose.Schema({
  /*name: { type: String },
  surname: { type: String },
  date: { type: String },
  town: { type: String },*/
  username: { type: String },
  email: { type: String  }
  /*imagePath: { type: String },
  userType: { type: String },*/
});

onlineSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Online", onlineSchema);
