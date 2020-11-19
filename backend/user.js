const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'veljo998@gmail.com',
    pass: 'veljo1006998780022'
  }
});
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type (user.js)");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now().toLocaleString() + "." + ext);
  }
})

const UserM = require("./userMongo");
const OnlineM = require("./onlineMongo");
const FollowM = require("./followMongo");
const checkAuth = require("./middleware");

const router = express.Router();

router.post("/add", multer({ storage: storage }).single("image"), (req, res, next) => {
  console.log("\n post(/registration) \n");
  bcrypt.hash(req.body.password, 10).
    then(hash => {
      const url = req.protocol + "://" + req.get("host");
      const user = new UserM({
        name: req.body.name,
        surname: req.body.surname,
        date: req.body.date,
        town: req.body.town,
        username: req.body.username,
        email: req.body.email,
        password: hash,
        imagePath: url + "/images/" + req.file.filename,
        userType: '',
        notification: ''
      });
      user
        .save()
        .then(result => {
          res.status(201).json({
            message: "User created!",
            result: result
          });
        })
        .catch(err => {
          /*
          GRESKA
          console.log("GRESKA   " + "backend/image/"+req.file.filename, (err1) => {
            console.log(err1);
          });
          await unlinkAsync(req.file.path)*/
          return res.status(500).json();
        });
    });
});

router.post("/login", (req, res, next) => {
  let fetchedUser;
  UserM.findOne({ username: req.body.username })
    .then(user => {
      if (!user) {
        return res.status(501).json();
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(502).json();
      }
      if (fetchedUser.userType == "") return res.status(504).json();
      if (fetchedUser.userType == "denied") return res.status(505).json();
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        "secret",
        { expiresIn: "1h" }
      );
      { //dodaj u ONLINE tabelu
        const onlineUser = new OnlineM({
          _id: fetchedUser._id,
          /*name: fetchedUser.name,
          surname: fetchedUser.surname,
          date: fetchedUser.date,
          town: fetchedUser.town,*/
          username: fetchedUser.username,
          email: fetchedUser.email,
          /*imagePath: fetchedUser.imagePath,
          type: fetchedUser.userType*/
        });
        //console.log(onlineUser);
        onlineUser
          .save()
          .then(result => {
            console.log("Online User updated! Login");
          })
          .catch(err => {
            return res.status(530).json(); // Nije lepo ubacen online, verovatno vec postoji
          });
      }
      res.status(200).json({
        token: token,
        id: fetchedUser._id,
        name: fetchedUser.name,
        surname: fetchedUser.surname,
        date: fetchedUser.date,
        town: fetchedUser.town,
        username: fetchedUser.username,
        email: fetchedUser.email,
        password: "",
        imagePath: fetchedUser.imagePath,
        type: fetchedUser.userType,
        notification: fetchedUser.notification
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(503).json();
    });
});

router.post("/validateUser", checkAuth, (req, res, next) => {
  //console.log("ODJE SAM");
  //console.log("aa");
  //console.log(req.body.valid);
  let fetchedUser;
  let decodedToken;
  UserM.findOne({ _id: req.body.idUser })
    .then(user => {
      if (!user) {
        return res.status(521).json(); //ne postoji
      }
      fetchedUser = user;
      fetchedUser.userType = req.body.valid;
      fetchedUser
        .save()
        .then(result => {
          res.status(201).json({
            message: "User updated!",
            result: result
          });
        })
        .catch(err => {
          return res.status(522).json();
        });

    })
    .catch(err => {
      console.log(err);
      return res.status(523).json();
    });
});
router.post("/checkAndMail", (req, res, next) => {
  let fetchedUser;
  UserM.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(510).json(); //ne postoji
      }
      fetchedUser = user;
      const tokenMail = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        "secret",
        { expiresIn: "1h" }
      );
      transporter.sendMail(
        {
          from: 'djorovicveljko@gmail.com',
          to: req.body.email,
          subject: 'Reset password',
          text: 'Hi you, visit link: \n' +
            'http://localhost:4200/resetPassword/' + user.username + "/" + tokenMail
        }, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      res.status(200).json({
        name: user.name,
        surname: user.surname,
        username: user.username
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(503).json();
    });
});
router.post("/resetPasswordMail", (req, res, next) => {
  let fetchedUser;

  let decodedTokenMail;
  try {
    decodedTokenMail = jwt.verify(req.body.tokenMail, "secret");
  } catch (err) {
    return res.status(514).json();
  }
  UserM.findOne({ email: decodedTokenMail.email })
    .then(user => {
      if (!user) {
        return res.status(511).json(); //ne postoji
      }
      fetchedUser = user;
      bcrypt.hash(req.body.password, 10).
        then(hash => {
          fetchedUser.password = hash;
          fetchedUser
            .save()
            .then(result => {
              res.status(201).json({
                message: "User updated!",
                result: result
              });
            })
            .catch(err => {
              return res.status(512).json();
            });
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(513).json();
    });
});
router.post("/changePassword", checkAuth, (req, res, next) => {
  let fetchedUser;
  let decodedToken;
  try {
    decodedToken = jwt.verify(req.body.token, "secret");
  } catch (err) {
    console.log("Ako ovde dodjem ne radi");
    return res.status(520).json(); //istekla sesija
  }
  UserM.findOne({ email: decodedToken.email })
    .then(user => {
      if (!user) {
        return res.status(521).json(); //ne postoji
      }
      fetchedUser = user;
      bcrypt.hash(req.body.password, 10).
        then(hash => {
          fetchedUser.lastLogin = (new Date()).toString();
          fetchedUser.password = hash;
          fetchedUser
            .save()
            .then(result => {
              res.status(201).json({
                message: "User updated!",
                result: result
              });
            })
            .catch(err => {
              return res.status(522).json();
            });
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(523).json();
    });
});
router.post("/update", checkAuth, (req, res, next) => {
  let fetchedUser;
  let decodedToken;
  try {
    decodedToken = jwt.verify(req.body.token, "secret");
  } catch (err) {
    return res.status(520).json(); //istekla sesija
  }
  UserM.findOne({ email: decodedToken.email })
    .then(user => {
      if (!user) {
        return res.status(521).json(); //ne postoji
      }
      fetchedUser = user;
      fetchedUser.lastLogin = (new Date()).toString();
      fetchedUser.name = req.body.name;
      fetchedUser.surname = req.body.surname;
      fetchedUser.date = req.body.date;
      fetchedUser.town = req.body.town;
      fetchedUser
        .save()
        .then(result => {
          res.status(201).json({
            message: "User updated!",
            result: result
          });
        })
        .catch(err => {
          return res.status(522).json();
        });

    })
    .catch(err => {
      console.log(err);
      return res.status(523).json();
    });
});
router.post("/updatePhoto", multer({ storage: storage }).single("image"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  let fetchedUser;
  let decodedToken;
  try {
    decodedToken = jwt.verify(req.body.token, "secret");
  } catch (err) {
    return res.status(520).json(); //istekla sesija
  }
  UserM.findOne({ email: decodedToken.email })
    .then(user => {
      if (!user) {
        return res.status(521).json(); //ne postoji
      }
      fetchedUser = user;
      fetchedUser.imagePath = url + "/images/" + req.file.filename,
        fetchedUser
          .save()
          .then(result => {
            res.status(201).json({
              imagePath: fetchedUser.imagePath
            });
          })
          .catch(err => {
            return res.status(522).json();
          });

    })
    .catch(err => {
      console.log(err);
      return res.status(523).json();
    });
});
router.post("/logout", (req, res, next) => {
  let fetchedUser;
  //console.log("req.body.idUser" + req.body.idUser);
  UserM.findOne({ _id: req.body.idUser })
    .then(user => {
      if (!user) {
        return res.status(521).json(); //ne postoji
      }
      fetchedUser = user;
      fetchedUser.lastLogin = (new Date()).toLocaleString();
      OnlineM.deleteOne({ _id: req.body.idUser })
        .then(ok => {
          fetchedUser.lastLogin = (new Date()).toLocaleString();
          fetchedUser.notification = "";
          fetchedUser
            .save()
            .then(result => {
              //console.log("Odjavljiven");
              //console.log(fetchedUser);
              res.status(201).json({
                message: "User logged out",
                result: result
              });
            })
            .catch(err => {
              console.log(err);
              return res.status(522).json(); // nije lepo sacuvan
            });
        }).catch(err => {
          console.log(err);
          return res.status(532).json(); // nije obrisan
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(523).json();
    });
});
router.post("/checkLastSeen", (req, res, next) => {
  let fetchedUser;
  //ovde se desava da ti on prilikom logovanje nije stigao da ubaci u bazu online i zato vraca da nije aktivan
  OnlineM.findOne({ _id: req.body.id })
    .then(user => {
      if (!user) {
        UserM.findOne({ _id: req.body.id })
          .then(userr => {
            res.status(201).json({
              lastSeen: userr.lastLogin
            });
          });
      }
      else
        res.status(201).json({
          lastSeen: "Aktivan"
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(523).json();
    });
});
router.post("/searchUser", (req, res, next) => {
  console.log(req.body.email);
  UserM.find({
    // $or: [ {svaki red u viticastu}
    name: { "$regex": req.body.name, "$options": "i" },
    surname: { "$regex": req.body.surname, "$options": "i" },
    username: { "$regex": req.body.username, "$options": "i" },
    email: { "$regex": req.body.email, "$options": "i" }
    // ]
  }).
    then(users => {
      if (!users) {
        return res.status(504).json();
      }
      else {
        console.log(users);
        res.status(201).json({
          userss: JSON.stringify(users)
        });
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(533).json();
    });
});
router.post("/searchUserById", (req, res, next) => {
  UserM.findOne({ _id: req.body.id }).
    then(user => {
      if (!user) {
        return res.status(504).json();
      }
      else
        res.status(201).json({
          userr: JSON.stringify(user)
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(533).json();
    });
});
router.post("/followUser", (req, res, next) => {
  const follow = new FollowM({
    idUserFrom: req.body.idUserFrom,
    idUserTo: req.body.idUserTo,
    usernameFrom: req.body.usernameFrom,
    usernameTo: req.body.usernameTo
  });
  follow
    .save()
    .then(result => {
      res.status(201).json();
    })
    .catch(err => {
      return res.status(500).json();
    });
});
router.post("/doesFollow", (req, res, next) => {
  let fetchedFollow;
  FollowM.findOne({ idUserFrom: req.body.idUserFrom, idUserTo: req.body.idUserTo })
    .then(follow => {
      if (!follow) {
        return res.status(201).json({
          yesOrNo: false
        });
      }
      fetchedFollow = follow;
      return res.status(201).json({
        yesOrNo: true
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(503).json();
    });
});

router.post("/unfollowUser", (req, res, next) => {
  FollowM.deleteOne({ idUserFrom: req.body.idUserFrom, idUserTo: req.body.idUserTo })
    .then(ok => {
      //console.log("OKej, otrpracen je");
    }).catch(err => {
      console.log(err);
      return res.status(532).json(); // nije obrisan
    });
});

router.post("/getFollowingForUserId", (req, res, next) => {

  FollowM.find({ idUserFrom: req.body.idUserFrom })
    .then(follows => {
      return res.status(201).json({
        users: JSON.stringify(follows)
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(503).json();
    });
});
module.exports = router;
