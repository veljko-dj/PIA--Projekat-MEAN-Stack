const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const checkAuth = require("./middleware");

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type (book.js)");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images/books");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now().toLocaleString() + "." + ext);
  }
})

const BookM = require("./bookMongo");

const router = express.Router();

router.post("/add", multer({ storage: storage }).single("image"), (req, res, next) => {
  //validacija tokena
  //console.log("\n post(/addBook) \n");
  const url = req.protocol + "://" + req.get("host");
  const book = new BookM({
    title: req.body.title,
    photoURL: url + "/images/books/" + req.file.filename,
    authors: req.body.authors,
    date: req.body.date,
    genre: req.body.genre,
    description: req.body.description,
    rate: req.body.rate,
    numOfRate: req.body.numOfRate,
    valid: req.body.valid
  });
  book
    .save()
    .then(result => {
      res.status(201).json({
        message: "Book added!",
        result: result
      });
    })
    .catch(err => {
      return res.status(600).json();
    });
})

router.post("/getById", (req, res, next) => {
  let fetchedBook;
  BookM.findOne({ _id: req.body.id })
    .then(book => {
      if (!book) {
        return res.status(604).json();
      }
      else
        res.status(201).json({
          title: book.title,
          photoURL: book.photoURL,
          authors: book.authors,
          date: book.date,
          genre: book.genre,
          description: book.description,
          rate: book.rate,
          numOfRate: book.numOfRate,
          valid: book.valid
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(523).json();
    });
});

router.post("/searchBook", (req, res, next) => {
  let fetchedBook;
  BookM.find({
    // $or: [ {svaki red u viticastu}
    title: { "$regex": req.body.title, "$options": "i" },
    authors: { "$regex": req.body.authors, "$options": "i" },
    genre: { "$regex": req.body.genre, "$options": "i" }
    // ]
  }).
    then(books => {
      if (!books) {
        return res.status(504).json();
      }
      else
        //console.log(books);
        res.status(201).json({
          bookss: JSON.stringify(books)
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(533).json();
    });
});

router.post("/validateBook",checkAuth, (req, res, next) => {
  let fetchedBook;
  let decodedToken;
  BookM.findOne({ _id: req.body.idBook })
    .then(book => {
      if (!book) {
        return res.status(521).json(); //ne postoji
      }
      fetchedBook = book;
      fetchedBook.valid="true";
      fetchedBook
        .save()
        .then(result => {
          res.status(201).json({
            message: "Book updated!",
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

router.post("/updateBook", (req, res, next) => {
  let fetchedBook;
  /*let decodedToken;
  try {
    decodedToken = jwt.verify(req.body.token, "secret");
  } catch (err) {
    return res.status(520).json(); //istekla sesija
  }*/
  /*console.log(req.body.id);
  console.log(req.body.title);
  console.log(req.body.authors);
  console.log(req.body.description);
  console.log(req.body.date);*/
  BookM.findOne({ _id: req.body.id })
    .then(book => {
      if (!book) {
        return res.status(521).json(); //ne postoji
      }
      fetchedBook = book;
      fetchedBook.date = req.body.date
      fetchedBook.title = req.body.title;
      fetchedBook.description = req.body.description;
      fetchedBook.genre = req.body.genre.toString();
      fetchedBook.authors = req.body.authors;
      fetchedBook
        .save()
        .then(result => {
          res.status(201).json({
            message: "Book updated!",
            result: result
          });
        })
        .catch(err => {
          console.log(err);
          return res.status(522).json();
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(523).json();
    });
});


module.exports = router;
