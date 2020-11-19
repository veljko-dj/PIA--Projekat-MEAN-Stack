const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const eventCommSchema = mongoose.Schema({
  idUser: { type: String },
  idEvent: { type: String },
  comment: { type: String },  //ovo ce ujedno biiti i zahtevi
  username: { type: String },
  type: { type: String }  // ovde odredjujes da li je zahtev ili komentar
                          // "comment" ili "request"
});

eventCommSchema.plugin(uniqueValidator);

module.exports = mongoose.model("eventComm", eventCommSchema)
