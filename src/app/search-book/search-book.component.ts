import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '../registration.service';
import { User } from 'Models/User';
import { BookService } from '../book.service';
import { Subscription } from 'rxjs';
import { Book } from 'Models/Book';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-book',
  templateUrl: './search-book.component.html',
  styleUrls: ['./search-book.component.css']
})
export class SearchBookComponent implements OnInit {
  user: User;

  searchName: string = "";
  searchGenre: string = "Zanr";
  searchAuthor: string = "";
  searchedBooks: Book[];
  message: string;



  genres: any[];

  private servisGenreSub: Subscription;
  private servisBookSub: Subscription;

  constructor(private regServis: RegistrationService, private servisBook: BookService) { }

  initSearch() {
    this.searchName = "";
    this.searchGenre = "Zanr";
    this.searchAuthor = "";
  }
  createArrayOfBooks(status: string) {
    let a = JSON.parse(status.split("DELIMITER")[1]);
    this.searchedBooks = a;
    console.log(this.searchedBooks);
    for (var _i = 0; _i < this.searchedBooks.length; _i++) {
      this.searchedBooks[_i].id = a[_i]._id;
    }
    if (this.searchedBooks.length == 0) {
      this.message = "Nema knjiga po zadatom krijeterijumu";
      this.searchedBooks=null;
    } else this.message = "";
  }
  ngOnInit(): void {
    this.initSearch();
    this.user = this.regServis.checkIfLoggedIn();
    this.servisBook.getGenres();
    this.servisGenreSub = this.servisBook.getSubjectGenreToListen().subscribe(
      status => {
        if (status == "genre") console.log("Neuspesno dohvatanje Zanrova");
        else {
          this.genres = JSON.parse(status);
        }
      }
    );
    this.servisBookSub = this.servisBook.getSubjectToListen().subscribe(
      status => {
        if (status.split("/")[1] == "searchBook") {
          if (status.split("/")[2] == "neuspesno") this.message = "Neuspesna pretraga. Molimo pokusajte ponovo";
          else {
            this.createArrayOfBooks(status);
          }
        }
      }
    )
  }

  searchBook() {
    /*console.log(this.searchGenre);
    console.log(this.searchAuthor);
    console.log(this.searchName);*/
    if (this.searchGenre == "Zanr" && this.searchAuthor == "" && this.searchName == "") {
      this.message = "Morate pretrazivati bar po jednom kriterijumu";
      return;
    }
    if (this.searchGenre == "Zanr") this.searchGenre = ".";
    if (this.searchName == "") this.searchName = ".";
    if (this.searchAuthor == "") this.searchAuthor = ".";
    this.servisBook.searchBook(this.searchName, this.searchAuthor, this.searchGenre);
    this.initSearch();
  }



  logOut() {
    this.regServis.logOut(this.user.id);
  }

}
