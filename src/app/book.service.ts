import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Book } from 'Models/Book';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private subj = new Subject<string>();
  private subjGenre = new Subject<string>();
  private subjComm = new Subject<string>();


  constructor(private http: HttpClient, private router: Router) { }


  addGenre(genre1: string, token: string) {
    this.http
      .post<{
        message: string
      }>(
        "http://localhost:3000/genre/add", { newGenre: genre1, token: token }
      )
      .subscribe(response => {
        this.subjGenre.next("genre/uspesno");
      }, error => {
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        if (error.status == 530) this.subjGenre.next("genre/postoji");
        else this.subjGenre.next("genre");
      });
  }
  getGenres() {
    this.http
      .get<{
        genres: string
      }>("http://localhost:3000/genre/get")
      .subscribe(response => {
        this.subjGenre.next(response.genres);
      }, error => {
        this.subjGenre.next("genre");
      });
  }
  deleteGenre(genre: string, token: string) {
    console.log("genre" + genre);
    this.http
      .post<{
        message: string
      }>(
        "http://localhost:3000/genre/deleteGenre", { genre: genre, token: token }
        // "http://localhost:3000/genre/deleteGenre", { genre: genre }
      )
      .subscribe(response => {
        if (response.message == "Deleted") this.subjGenre.next("genre/delete/uspesno");
        else if (response.message == "Not deleted") this.subjGenre.next("genre/delete/neuspesno/postoji");
      }, error => {
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        else console.log("____book.service.ts/deleteGenre");
      });
  }

  addComm(idUser: string, idBook: string, comm: string, rate: string,
    username: string, authors: string, title: string, token: string) {
    console.log(authors);
    console.log(title);
    this.http
      .post<{
        message: string,
        newRate: string
      }>(
        "http://localhost:3000/bookComm/add", {
        idUser: idUser,
        idBook: idBook,
        comment: comm,
        rate: rate,
        username: username,
        authors: authors,
        title: title,
        token: token
      })
      .subscribe(response => {
        console.log("Uspesno")
        this.subjComm.next("bookComm/AddComm/uspesno/DELIMITER" + response.newRate);
      }, error => {
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        else this.subjComm.next("bookComm/AddComm/neuspesno");
      });
  }
  updateComm(idUser: string, idBook: string, comm: string, rate: string, username: string, token: string) {
    this.http
      .post<{
        message: string,
        newRate: string
      }>(
        "http://localhost:3000/bookComm/update", {
        idUser: idUser,
        idBook: idBook,
        comment: comm,
        rate: rate,
        username: username,
        token: token
      })
      .subscribe(response => {
        this.subjComm.next("bookComm/updateComm/uspesno/DELIMITER" + response.newRate);
      }, error => {
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        else
          this.subjComm.next("bookComm/updateComm/neuspesno");
      });
  }
  getCommentsByBookId(id: string) {
    this.http
      .post<{
        status: number,
        comments: string //ovaj string je JSON
      }>("http://localhost:3000/bookComm/getByBookId", { idBook: id })
      .subscribe(response => {
        if (response.status == 403) this.subjComm.next("bookComm/getComms/neuspesno");
        else this.subjComm.next("bookComm/getComms/uspesno/DELIMITER" + response.comments);
      }, error => {
        this.subjGenre.next("bookComm");
      });
  }


  addBook(book1: Book, token: string) {
    const userData = new FormData();
    userData.append("title", book1.title);
    userData.append("authors", book1.authors);
    userData.append("valid", book1.valid);
    userData.append("date", book1.date.toLocaleString());
    userData.append("genre", book1.genre.toString());
    userData.append("description", book1.description);
    userData.append("rate", book1.rate);
    userData.append("numOfRate", book1.numOfRate);
    userData.append("image", book1.photo, book1.title);
    //console.log(token);
    //debugger
    userData.append("token", token);
    this.http.post("http://localhost:3000/book/add", userData)
      .subscribe(response => {
        this.subj.next("book/uspesno");
      }, error => {
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        else
          this.subj.next("book/neuspesno");
        if (error.status == 500) this.subj.next("addBook");
      })

  }
  updateBook(book1: Book) {
    //console.log("Book"+book1);
    //console.log(book1.date);
    this.http
      .post<{
        message: string
      }>(
        "http://localhost:3000/book/updateBook", {
        id: book1.id,
        title: book1.title,
        authors: book1.authors,
        date: book1.date.toLocaleString(),
        genre: book1.genre,
        description: book1.description
      }
      )
      .subscribe(response => {
        this.subj.next("updateBook/uspesno");
      }, error => {
        console.log("______book.service.ts/updateBook" + error);
      });
  }
  validateBook(idBook: string, token: string) {
    this.http
      .post<{
        message: string,
        newRate: string
      }>(
        "http://localhost:3000/book/validateBook", {
        idBook: idBook,
        token: token
      })
      .subscribe(response => {
        this.subj.next("book/validateBook/uspesno");
      }, error => {
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        else console.log("book/validate/neuspesno");
        // this.subj.next("book/validateBook/neuspesno");
      });
  }
  getBookById(id1: string) {
    this.http
      .post<{
        title: string,
        photoURL: string,
        authors: string,
        date: string,
        genre: string,
        description: string,
        rate: string,
        valid: string,
        numOfRate: string
      }>("http://localhost:3000/book/getById", { id: id1 })
      .subscribe(response => {
        console.log(response.rate);
        let tmpBook: Book = {
          valid: response.valid, authors: response.authors,
          date: new Date(response.date), description: response.description,
          genre: response.genre.split(','), id: id1,
          photoPath: response.photoURL, photo: null, rate: response.rate,
          title: response.title, numOfRate: response.numOfRate
        };
        this.subj.next(JSON.stringify(tmpBook));
      }, error => {
        this.subj.next("genre");
      });
  }
  getReadingStatusForBookAndUser(idBook: string, idUser: string) {
    this.http
      .post<{
        type: string
      }>("http://localhost:3000/readBook/getStatus", { idBook: idBook, idUser: idUser })
      .subscribe(response => {
        this.subj.next("book/getStatus/uspesno/DELIMITER" + response.type);
      }, error => {
        this.subj.next("book/getStatus/neuspesno");
      });
  }
  setReadingStatusForBookAndUser(idBook: string, idUser: string, type: string, title: string, authors: string, genre: string) {
    this.http
      .post("http://localhost:3000/readBook/add", { idBook: idBook, idUser: idUser, type: type, title: title, authors: authors, genre: genre })
      .subscribe(response => {
        console.log("Uspesno apdejtovanje statusa citanja");
      }, error => {
        console.log("DESILA SE NEKA GRESKA U POSTAVLJANJU STATUSA CITANJA")
      });
  }
  searchBook(title: string, authors: string, genre: string) {
    this.http
      .post<{
        bookss: string;
      }>("http://localhost:3000/book/searchBook", { title: title, authors: authors, genre: genre })
      .subscribe(response => {
        this.subj.next("book/searchBook/uspesno/DELIMITER" + response.bookss);
      }, error => {
        this.subj.next("book/searchBook/neuspesno");
      });
  }

  getSubjectToListen() {
    return this.subj.asObservable();
  }
  getSubjectGenreToListen() {
    return this.subjGenre.asObservable();
  }
  getSubjectCommToListen() {
    return this.subjComm.asObservable();
  }
}
