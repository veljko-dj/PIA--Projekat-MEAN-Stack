const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
}

const EventM = require("./eventMongo");
const EventCommM = require("./eventCommMongo");
const checkAuth = require("./middleware");
const router = express.Router();

router.post("/add", checkAuth, (req, res, next) => {
  //validacija tokena
  //console.log("\n post(/addBook) \n");
  const event = new EventM({
    name: req.body.name,
    dateStart: req.body.dateStart,
    dateEnd: req.body.dateEnd,
    description: req.body.description,
    public: req.body.public,
    guests: req.body.guests,
    valid: req.body.valid,
    active: req.body.active
  });
  event
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Book added!",
        id: result._id
      });
    })
    .catch(err => {
      return res.status(600).json();
    });
})

router.post("/getById", (req, res, next) => {
  EventM.findOne({ _id: req.body.id }).
    then(ev => {
      if (!ev) {
        return res.status(504).json(); //trealo bi da postoji
      }
      else {
        //console.log(ev);
        return res.status(201).json({
          event: JSON.stringify(ev)
        });
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(533).json();
    });
});

router.post("/getAllEvents", (req, res, next) => {
  EventM.find().
    then(eventss => {
      //console.log(events);
      return res.status(201).json({
        events: JSON.stringify(eventss)
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(533).json();
    });
});

router.post("/updateActiveAndValid",checkAuth, (req, res, next) => {
  let fetchedEvent;
  let decodedToken;
  /*try {
    decodedToken = jwt.verify(req.body.token, "secret");
  } catch (err) {
    return res.status(520).json(); //istekla sesija
  }*/
  EventM.findOne({ _id: req.body.id })
    .then(evv => {
      if (!evv) {
        return res.status(521).json(); //ne postoji
      }
      fetchedEvent = evv;
      fetchedEvent.active = req.body.active;
      fetchedEvent.valid = req.body.valid;
      fetchedEvent
        .save()
        .then(result => {
          res.status(201).json({
            message: "Event updated!",
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
router.post("/addComment",checkAuth, (req, res, next) => {
  //validacija tokena

  const eventComm = new EventCommM({
    idUser: req.body.idUser,
    idEvent: req.body.idEvent,
    comment: req.body.comment,
    username: req.body.username,
    type: req.body.type
  });
  eventComm
    .save()
    .then(result => {
      //console.log(result);
      res.status(201).json({
        message: "CommentEvent added!",
        id: result
      });
    })
    .catch(err => {
      return res.status(600).json();
    });
})

router.post("/getAllComments", (req, res, next) => {
  EventCommM.find({ idEvent: req.body.idEvent, type: req.body.type }).
    then(eventss => {
      //console.log(events);
      return res.status(201).json({
        comments: JSON.stringify(eventss)
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(533).json();
    });
});

router.post("/acceptRequests",checkAuth, (req, res, next) => {
  let fetchedEvent;
  let decodedToken;
  EventM.findOne({ _id: req.body.idEvent })
    .then(evv => {
      if (!evv) {
        return res.status(521).json(); //ne postoji
      }
      fetchedEvent = evv;
      //fetchedUser.town = req.body.town;
      //console.log("fe.guestsPRE"+fetchedEvent.guests);
      //console.log("body.req"+req.body.req);
      let nizF = fetchedEvent.guests.split(',');
      let admin = nizF.pop();
      let nizR = req.body.requests.split(',');
      let newG = nizF.concat(nizR);
      newG.push(admin);
      fetchedEvent.guests = newG.toString();
      //console.log("fe.guests"+fetchedEvent.guests);
      fetchedEvent
        .save()
        .then(result => {
          nizR.forEach(element => {
            //console.log(element.split("DELIMG"));
            //console.log(fetchedEvent._id);
            EventCommM.deleteMany({ idEvent: fetchedEvent._id, idUser: element.split("DELIMG")[0], type: "request" }).then(
              re => {
                //console.log("PRODJOH");
                //console.log(re);
                res.status(201).json({
                  message: "Event updated!",
                  result: result
                });
              }
            )
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

module.exports = router;
