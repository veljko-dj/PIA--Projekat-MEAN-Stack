const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    //console.log("aaa"+req.body.token);
     jwt.verify(req.body.token, "secret");
    next();
  } catch (err) {
    return res.status(520).json(); //istekla sesija
  }
};
