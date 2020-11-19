const express = require("express");
const router = express.Router();

const genreM = require("./genreMongo");
const BookM = require("./bookMongo");
const checkAuth = require("./middleware");

router.post("/add",checkAuth, (req, res, next) => {
  genreM.findOne({ name: req.body.newGenre })
    .then(found => {
      if (found)
        return res.status(530).json(); //vec postoji
      else {
        const genre = new genreM({
          name: req.body.newGenre
        });
        genre
          .save()
          .then(result => {
            res.status(201).json({
              message: "Genre added!"
            });
          })
      }

    })
    .catch(err => {
      return res.status(531).json(); //ne znam koja greska
    });
})
router.get("/get", (req, res, next) => {
  genreM.find({})
    .then(found => {
      if (!found)
        return res.status(530).json(); // ne postoji
      else {
        res.status(201).json({
          genres: JSON.stringify(found)
        });
      }

    })
    .catch(err => {
      return res.status(531).json(); //ne znam koja greska
    });
})

router.post("/deleteGenre",checkAuth, (req, res, next) => {
  //console.log("AAA");
  BookM.find({ genre: { "$regex": req.body.genre, "$options": "i" } }).
    then(books => {
      if (books.length > 0) {
        return res.status(201).json({
          message: "Not deleted"
        });
      }
      else {
        genreM.deleteOne({ name: req.body.genre })
          .then(ok => {
            return res.status(201).json({
              message: "Deleted"
            });
          }).catch(err => {
            console.log(err);
            return res.status(533).json();
          });
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(533).json();
    });
})



module.exports = router;
