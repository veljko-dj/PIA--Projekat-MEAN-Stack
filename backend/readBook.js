const express = require("express");
const router = express.Router();

const readBookM = require("./readBookMongo");
const checkAuth = require("./middleware");
const { EDESTADDRREQ } = require("constants");

router.post("/add", (req, res, next) => {
  readBookM.findOne({ idBook: req.body.idBook, idUser: req.body.idUser })
    .then(found => {
      if (found) {
        readBookM.updateOne({
          idBook: req.body.idBook, idUser: req.body.idUser
        }, { $set: { type: req.body.type } }).catch(err => {
          return res.status(603).json(); //neuspesno dodata
        });
      } else {
        const readBook = new readBookM({
          idUser: req.body.idUser,
          idBook: req.body.idBook,
          type: req.body.type,
          title: req.body.title,
          authors: req.body.authors,
          genre: req.body.genre
        });
        readBook
          .save()
          .then(result => {
            res.status(201).json({
              message: "readBook added!",
              result: result
            });
          }).catch(err => {
            return res.status(605).json(); //neuspesno dodata
          });
      }
    }).catch(err => {
      return res.status(600).json(); //neuspesno dodata
    });
})
router.post("/getStatus", (req, res, next) => {
  readBookM.findOne({ idUser: req.body.idUser, idBook: req.body.idBook })
    .then(found => {
      if (!found)
        return res.status(201).json({
          type: "none"
        }); // ne postoji
      else {
        res.status(201).json({
          type: found.type
        });
      }

    })
    .catch(err => {
      return res.status(531).json(); //ne znam koja greska
    });
})
router.post("/getByUserIdAndType", (req, res, next) => {
  //console.log("DOsao do ovde");
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const commQuery = readBookM.find({ idUser: req.body.idUser, type: { "$regex": req.body.type, "$options": "i" } });
  let fetchedComm;
  if (pageSize && currentPage && pageSize!=0) {
    commQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  commQuery
    .then(documents => {
      fetchedComm = documents;
      return readBookM.count({ idUser: req.body.idUser, type: { "$regex": req.body.type, "$options": "i" } });
    })
    .then(count => {
      //console.log(count);
      res.status(200).json({
        message: "Posts fetched successfully!",
        books: JSON.stringify(fetchedComm),
        maxBooks: count
      });
    });

})
router.post("/deleteReadBook",checkAuth, (req, res, next) => {
  //console.log("DOsao do ovde");
  readBookM.deleteOne({ idBook: req.body.idBook, idUser: req.body.idUser })
    .then(ok => {
      console.log("deleteReadBook" + "OK");
    }).catch(err => {
      return res.status(532).json(); // nije obrisan
    });
})



module.exports = router;
