const express = require("express");
const router = express.Router();

const BookCommM = require("./bookCommMongo");
const BookM = require("./bookMongo");
const FollowM = require("./followMongo");
const userM = require("./userMongo");
const { ok } = require("assert");
const checkAuth = require("./middleware");

router.post("/add",checkAuth, (req, res, next) => {
  //validacija tokena

  const bookComm = new BookCommM({
    idUser: req.body.idUser,
    idBook: req.body.idBook,
    comment: req.body.comment,
    rate: req.body.rate,
    username: req.body.username,
    authors: req.body.authors,
    title: req.body.title
  });
  bookComm
    .save()
    .then(result => {
      BookM.findOne({ _id: req.body.idBook })
        .then(book1 => {
          if (!book1)
            return res.status(540).json(); // ne postoji iako bi trebalo
          let a = parseFloat(book1.rate);
          let b = parseFloat(book1.numOfRate);
          a = a * 1.0 * b++ + parseFloat(req.body.rate);
          a = a * 1.0 / b;
          book1.numOfRate = b.toFixed(1).toString();
          book1.rate = a.toFixed(1).toString();
          book1
            .save()
            .then(result => {
              /*---------------*/
              //console.log("req.body.idUser" + req.body.idUser);
              FollowM.find({ idUserTo: req.body.idUser })
                .then(founds => {
                  //console.log("founds" + founds);
                  //console.log("founds.length" + founds.length)
                  if (!founds || founds.length == 0)
                    return res.status(201).json({
                      message: "Book updated!",
                      newRate: a
                    }); // ne postoji  pracenje
                  founds.forEach(element => {
                    userM.findOne({ _id: element.idUserFrom })
                      .then(resu => {
                        resu.notification = resu.notification + "Korisnik" + bookComm.username + "je ostavio komentar na knjizi" + bookComm.title + "DELLBOOKCOMM\n";
                        //console.log("resu.notificcations" + resu.notification);
                        resu.save()
                          .then(OK => {
                            return res.status(201).json({
                              message: "Book updated!",
                              newRate: a
                            });
                          }).catch(err => {
                            console.log(err);
                          });
                      })
                      .catch(err => {
                        return res.status(529).json(); // Nesupesno apdejtovan
                        //ovde treba da se obrise podatak iz baze komentara ili da se pokusa opet
                      });
                  });

                });
              /*------------------*/
            })
            .catch(err => {
              return res.status(527).json(); // Nesupesno apdejtovan
              //ovde treba da se obrise podatak iz baze komentara ili da se pokusa opet
            });
        })
    })
    .catch(err => {
      return res.status(601).json();
    });
})
router.post("/update",checkAuth, (req, res, next) => {
  //validacija tokena
  let fetchedComm;
  let oldRate;
  BookCommM.findOne({ idUser: req.body.idUser, idBook: req.body.idBook })
    .then(found => {
      if (!found) {
        return res.status(521).json(); //ne postoji GRESKA
      }
      fetchedComm = found;
      oldRate = fetchedComm.rate;
      fetchedComm.comment = req.body.comment;
      fetchedComm.rate = req.body.rate;
      fetchedComm
        .save()
        .then(result => {
          BookM.findOne({ _id: req.body.idBook })
            .then(book1 => {
              if (!book1)
                return res.status(540).json(); // ne postoji iako bi trebalo
              let a = parseFloat(book1.rate);
              let b = parseFloat(book1.numOfRate);
              a = a * 1.0 * b - parseFloat(oldRate) + parseFloat(req.body.rate);
              a = a * 1.0 / b;
              book1.numOfRate = b.toFixed(1).toString();
              book1.rate = a.toFixed(1).toString();
              /*--------- */
              book1
                .save()
                .then(result => {
                  /*---------------*/
                  console.log(req.body.idUser);
                  FollowM.find({ idUserTo: req.body.idUser })
                    .then(founds => {
                      console.log(founds);
                      if (!founds || founds.length == 0)
                        return res.status(201).json({
                          message: "Book updated!",
                          newRate: a
                        });
                      founds.forEach(element => {
                        userM.findOne({ _id: element.idUserFrom })
                          .then(resu => {
                            resu.notification = resu.notification + "Korisnik" + fetchedComm.username + "je ostavio komentar na knjizi" + fetchedComm.title + "\n";
                            resu.save()
                              .then(OK => {
                                res.status(201).json({
                                  message: "Book updated!",
                                  newRate: a
                                });
                              }).catch(err => {
                                console.log(err);
                              });
                          })
                          .catch(err => {
                            console.log(err);
                            return res.status(529).json(); // Nesupesno apdejtovan
                            //ovde treba da se obrise podatak iz baze komentara ili da se pokusa opet
                          });
                      });

                    });
                  /*------------------*/
                })
                .catch(err => {
                  return res.status(527).json(); // Nesupesno apdejtovan
                  //ovde treba da se obrise podatak iz baze komentara ili da se pokusa opet
                });
            })
        });
    })
    .catch(err => {
      return res.status(522).json();
    });
})

router.post("/getByBookId", (req, res, next) => {
  BookCommM.find({ idBook: req.body.idBook })
    .then(found => {
      if (!found)
        res.status(201).json({
          status: 403,
          comments: null
        });
      else {
        res.status(201).json({
          status: 201,
          comments: JSON.stringify(found)
        });
      }
    })
    .catch(err => {
      return res.status(531).json(); //ne znam koja greska
    });
})
router.post("/getByUserId", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const commQuery = BookCommM.find({ idUser: req.body.idUser });
  let fetcheComm;
  if (pageSize && currentPage) {
    commQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  commQuery
    .then(documents => {
      fetchedComm = documents;
      return BookCommM.count({ idUser: req.body.idUser });
    })
    .then(count => {
      //console.log(count);
      res.status(200).json({
        message: "Posts fetched successfully!",
        comments: JSON.stringify(fetchedComm),
        maxComm: count
      });
    });

})


module.exports = router;


/*BookCommM.findOne({ idBook: req.body.idBook, idUser: req.body.idUser })
    .then(found => {
      if (found) {
        BookCommM.updateOne({
          idBook: req.body.idBook, idUser: req.body.idUser
        }, {
          $set: {
            comment: req.body.comment,
            rate: req.body.rate
          }
        }).catch(err => {
          return res.status(603).json(); //neuspesno dodata
        });
      } else {
        const bookComm = new BookCommM({
          idUser: req.body.idUser,
          idBook: req.body.idBook,
          comment: req.body.comment,
          rate: req.body.rate,
          username: req.body.username
        });
        bookComm
          .save()
          .then(result => {
            BookM.findOne({ _id: req.body.idBook })
              .then(book1 => {
                if (!book1)
                  return res.status(540).json(); // ne postoji iako bi trebalo
                let a = parseFloat(book1.rate);
                let b = parseFloat(book1.numOfRate);
                a = a * 1.0 * b++ + parseFloat(req.body.rate);
                a = a * 1.0 / b;
                book1.numOfRate = b.toFixed(1).toString();
                book1.rate = a.toFixed(1).toString();
                book1
                  .save()
                  .then(result => {
                    res.status(201).json({
                      message: "Book updated!",
                      newRate: a
                    });
                  })
                  .catch(err => {
                    return res.status(522).json(); // Nesupesno apdejtovan
                    //ovde treba da se obrise podatak iz baze komentara ili da se pokusa opet
                  });
              })
          })
          .catch(err => {
            return res.status(601).json();
          });
      }
    }).catch(err => {
      return res.status(600).json(); //neuspesno dodata
    });

 */
