import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../book.service';
import { Subscription } from 'rxjs';
import { Book } from 'Models/Book';
import { User } from 'Models/User';
import { Comment } from 'Models/Comm';
import { RegistrationService } from '../registration.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  book: Book = {
    valid: null, authors: null,
    date: null, description: null,
    genre: null, id: null,
    photoPath: null, photo: null, rate: null,
    title: null, numOfRate: "0"
  };


  editTitle: boolean = false;
  editAuthors: boolean = false;
  editDate: boolean = false;
  newDate: Date;
  editGenre: boolean = false;
  editDescription: boolean = false;
  messageError: string = "";
  newGenre0: string = "Zanr";
  newGenre1: string = "Zanr";
  newGenre2: string = "Zanr";
  genres: any[] = [];

  //new comm
  comm: string = "";
  user: User;
  rating: string = "";
  messageCommError: string;
  messageComm: string;
  editComm: boolean = false;
  //comments
  messageAllComms: string;
  allComments: Comment[];

  showComments: boolean = false;

  readingStatus: string = "none";
  progressWidth: number = 0;
  pageNum: number;
  pageMax: number;


  private sub: Subscription;
  private subComm: Subscription;
  private subGenre: Subscription;

  constructor(private activateRoute: ActivatedRoute, private servis: BookService, private regServis: RegistrationService) { }

  initReadingStatus() {
    this.servis.getReadingStatusForBookAndUser(this.book.id, this.user.id);
  }
  validateBook() {
    if (this.book.valid == "true") return;
    this.servis.validateBook(this.book.id, localStorage.getItem('token'));
  }
  changeReadingStatus() {
    if (this.readingStatus != "reading")
      this.servis.setReadingStatusForBookAndUser(this.book.id, this.user.id, this.readingStatus, this.book.title, this.book.authors, this.book.genre.toString());
    else {
      if ((this.pageMax != null && this.pageNum != null) && (this.pageMax >= this.pageNum)) {
        this.progressWidth = this.pageNum * 100 / this.pageMax;
        this.servis.setReadingStatusForBookAndUser(this.book.id, this.user.id,
          this.readingStatus + "-" + this.progressWidth.toString(), this.book.title, this.book.authors, this.book.genre.toString());
      }
    }
  }
  ngOnInit(): void {
    this.subGenre = this.servis.getSubjectGenreToListen().subscribe(
      status => {
        if (status == "genre") console.log("Neuspesno dohvatanje Zanrova");
        else {
          this.genres = JSON.parse(status);
          //PROVERI DA LI JE OVO DOLE OKEJ AKO NE RADI LEPO IZBACI OVAJ KOD IZ NGON INIT I PUSTI GA OVDE
          /*if (this.book.genre[0]) this.newGenre0 = this.book.genre[0];
          if (this.book.genre[1]) this.newGenre1 = this.book.genre[1];
          if (this.book.genre[2]) this.newGenre2 = this.book.genre[2];*/
        }
      }
    )
    this.sub = this.servis.getSubjectToListen().subscribe(
      status => {
        //console.log(status);
        if (status == "updateBook/uspesno") this.getBookInfo();
        else if (status.split('/')[1] == "getStatus") {
          if (status.split('/')[2] == "neuspesno") console.log("Neuspesno dohvatanje odnosa knjige i korisnika");
          else {
            this.readingStatus = status.split("DELIMITER")[1];
            //console.log(this.readingStatus);
            if (this.readingStatus.split('-')[0] == "reading") {
              this.progressWidth = parseInt(this.readingStatus.split('-')[1]);
              this.readingStatus = "reading";
              //console.log(this.progressWidth);
            }
          }
        } else if (status == "book/validateBook/uspesno") this.book.valid = "true";
        else if (status == "book/neuspesno") console.log("Neuspesno");
        else {
          this.book = JSON.parse(status);
          if (this.book.genre[0]) this.newGenre0 = this.book.genre[0];
          if (this.book.genre[1]) this.newGenre1 = this.book.genre[1];
          if (this.book.genre[2]) this.newGenre2 = this.book.genre[2];
        }
      }
    );
    this.subComm = this.servis.getSubjectCommToListen().subscribe(
      status => {
        if (status == "bookComm/AddComm/neuspesno") this.messageCommError = ("Neuspesno dodata komentar. Molimo Vas pokusajte ponovo");
        else if (status.split('/')[1] == "AddComm" && status.split('/')[2] == "uspesno") {
          this.messageComm = "Uspesno dodat komentar.";
          this.editComm = true;
          this.book.rate = status.split('DELIMITER')[1];
          this.servis.getCommentsByBookId(this.book.id);
        }
        else if (status.split('/')[1] == "updateComm" && status.split('/')[2] == "uspesno") {
          this.messageComm = "Uspesno izmenjen komentar.";
          this.book.rate = status.split('DELIMITER')[1];
          let usss = this.user;
          let eCom = this.comm;
          let eRate = this.rating;
          this.allComments.filter(function (c) {
            if (c.idUser == usss.id) {
              c.comment = eCom;
              c.rate = eRate;
            }
          });
        }
        else if (status == "bookComm/updateComm/neuspesno") this.messageCommError = "Neuspesno izmenjen komentar. Pousajte opet";
        else if ((status.split('/')[1]) == "getComms")
          if (status.split('/')[2] == "uspesno") {
            this.allComments = JSON.parse(status.split('DELIMITER')[1]);
            let usss = this.user;
            let a = this.allComments.filter(function (c) { return c.username == (usss.username) });
            if (a.length > 0) {
              this.comm = a[0].comment;
              this.rating = a[0].rate;
              this.editComm = true;
              //console.log(a[0]);
            }
            //console.log(this.allComments);
          }
          else this.messageAllComms = "Nema komentara za ovu knjigu";
      });
    this.getBookInfo();
    this.getComments();
    this.user = JSON.parse(localStorage.getItem('user'));
    this.initReadingStatus();
    this.servis.getGenres();
  }
  getComments() {
    this.servis.getCommentsByBookId(this.book.id);
  }
  getBookInfo() {
    this.book.id = this.activateRoute.snapshot.paramMap.get('id');
    this.servis.getBookById(this.book.id);
  }
  addComm() {
    if (this.comm == "" || this.rating == "") {
      this.messageCommError = "Morate uneti komentar i ocenu";
      return;
    }
    if (this.comm.length > 100) {
      this.messageCommError = "Komentar mora biti manji od 100 karaktera";
      return;
    }

    //ovde token prosledjujes
    this.servis.addComm(this.user.id, this.book.id, this.comm, this.rating.toString(), this.user.username, this.book.authors, this.book.title,localStorage.getItem('token'));
    this.messageCommError = "";
    this.messageComm = "";
  }
  updateComm() {
    if (this.comm == "" || this.rating == "") {
      this.messageCommError = "Morate uneti komentar i ocenu";
      return;
    }
    if (this.comm.length > 100) {
      this.messageCommError = "Komentar mora biti manji od 100 karaktera";
      return;
    }
    //ovde token prosledjujes
    this.servis.updateComm(this.user.id, this.book.id, this.comm, this.rating.toString(), this.user.username,localStorage.getItem('token'));
    this.messageCommError = "";
    this.messageComm = "";
  }

  checkNewDate(): boolean {
    this.editDate = (!this.editDate);
    let tmpDate = new Date(this.newDate);
    if (this.editDate == false) {
      if (this.newDate && (tmpDate.getTime() < (new Date()).getTime())) {
        this.user.date = tmpDate;
        this.messageError = "";
      }
      else {
        this.messageError = "Unesite validan datum";
        this.editDate = (!this.editDate);
      }
    }
    this.book.date = this.newDate;
    return true;
  }
  checkNewGenre(): boolean {
    if (this.newGenre0 == "Zanr" && this.newGenre1 == "Zanr" && this.newGenre2 == "Zanr") {
      this.messageError = "Unesite bar neki";
      return true;
    }
    let k = 0;
    let newGenre: string[] = [];
    if (this.newGenre1 != "Zanr") newGenre[k++] = this.newGenre1;
    if (this.newGenre2 != "Zanr" && this.newGenre2 != this.newGenre1) newGenre[k++] = this.newGenre2;
    if (this.newGenre0 != "Zanr" && this.newGenre0 != this.newGenre1 && this.newGenre2 != this.newGenre0) newGenre[k++] = this.newGenre0;
    this.book.genre = newGenre;
    this.editGenre = !this.editGenre;
    return true;
  }
  updateBook(): boolean {
    console.log("Dotore" + this.editDate + this.editTitle + this.editGenre
      + this.editAuthors + this.editDescription);
    // if (!this.editDate && !this.editTitle && !this.editGenre
    // && !this.editAuthors && !this.editDescription)
    console.log(this.book);
    this.servis.updateBook(this.book);
    return true;
  }
  /*
    changeEdit(a: string) {
      if (a == "Name") this.editName = (!this.editName);
      if (a == "Surname") this.editSurname = (!this.editSurname);
      //if (a=="Username") this.editUsername=(!this.editUsername);
      if (a == "Date") {
        this.editDate = (!this.editDate);
        let tmpDate = new Date(this.newDate);
        if (this.editDate == false) {
          if (this.newDate && (tmpDate.getTime() < (new Date()).getTime())) {
            this.user.date = tmpDate;
            this.messageError = "";
          }
          else {
            this.messageError = "Unesite validan datum";
            this.editDate = (!this.editDate);
          }
        }
      }
      //if (a=="Email") this.editEmail=(!this.editEmail);
      if (a == "Town") this.editTown = (!this.editTown);
      if (a == "Photo") {
        this.editPhoto = !this.editPhoto;
        if (this.editDate == false) {
        }
      }
    }*/
  logOut() {
    this.regServis.logOut(this.user.id);
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.subComm.unsubscribe();
  }

}
