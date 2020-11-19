import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RegistrationService } from '../registration.service';
import { User } from 'Models/User';
import { Author } from 'Models/Author';
import { BookService } from '../book.service';
import { Book } from 'Models/Book';
import { title } from 'process';

@Component({
  selector: 'app-new-book',
  templateUrl: './new-book.component.html',
  styleUrls: ['./new-book.component.css']
})
export class NewBookComponent implements OnInit {
  user: User;

  photo: File;
  photoURL: string;
  title: string;
  authors: string;
  date: Date;
  genre: string[] = [];
  genre0: string;
  genre1: string;
  genre2: string;
  description: string;
  rate: number;

  genres: any[];

  message: string;



  messageRow1: string;
  messageRow2: string;
  messageRow3: string;

  private servisSub: Subscription;
  private servisGenreSub: Subscription;

  constructor(private formBuilder: FormBuilder, private servis: RegistrationService,
    private servisBook: BookService) {
    this.photo = null;
  }
  initMessageError() {
    this.messageRow1 = null;
    this.messageRow2 = null;
    this.messageRow3 = null;
  }
  isMessageErrorEmpty(): boolean {
    if (this.messageRow1 != null) return false;
    if (this.messageRow2 != null) return false;
    if (this.messageRow3 != null) return false;
    return true;
  }
  ngOnInit(): void {
    this.genre0 = "Zanr";
    this.genre1 = this.genre0;
    this.genre2 = this.genre1;
    this.servisBook.getGenres();
    this.user = this.servis.checkIfLoggedIn();
    this.servis.checkIfGuest(this.user);
    this.servisGenreSub = this.servisBook.getSubjectGenreToListen().subscribe(
      status => {
        if (status == "genre") console.log("Neuspesno dohvatanje Zanrova");
        else {
          this.genres = JSON.parse(status);
        }
      }
    );
    this.servisSub = this.servisBook.getSubjectToListen().subscribe(
      status => {
        if (status == "book/neuspesno") this.message = "Neuspesno dodata knjiga. Molimo Vas pokusajte ponovo";
        else if (status == "book/uspesno") this.message = "Uspesno dodata knjiga";

      }
    )
    this.initMessageError();
    //this.privremeniPodaciZaDodavanje();
  }
  checkPhoto(event: Event) {
    //console.log("checkPhoto");
    this.photo = (event.target as HTMLInputElement).files[0];

    //console.log(this.photo);
    const reader = new FileReader();
    reader.onload = () => {
      this.photoURL = reader.result as string;
      //console.log(this.photoURL);
    }
    reader.readAsDataURL(this.photo);
  }
  privremeniPodaciZaDodavanje() {
    this.title = "Gospodari prstenova";
    this.authors = "Ko god je napisao, drugi neko";
    this.date = new Date("1998-06-10");
    this.description = "Opis neki ovde bla bal";
  }
  addBook() {
    this.message = "";
    this.initMessageError();
    { //Da li je sve uneto
      if (this.title == "" || this.title == null) this.messageRow1 = "Unesite sve podatke";
      if (this.authors == "" || this.authors == null) this.messageRow1 = "Unesite sve podatke";
      if (this.date == null) this.messageRow2 = "Unesite sve podatke";
      if (this.description == "" || this.description == null) this.messageRow3 = "Unesite sve podatke";
      if (this.genre0 == "Zanr" && this.genre1 == "Zanr" && this.genre2 == "Zanr") this.messageRow3 = "Unesite sve podatke";
      if (!this.isMessageErrorEmpty()) {
        console.log("Da li je sve uneto");
        return;
      }
    }
    { //Da li je datum validan
      this.date = new Date(this.date);
      var now = new Date();
      if (this.date.getTime() > now.getTime()) this.messageRow2 = "Nevalidan datum";
      if (!this.isMessageErrorEmpty()) {
        console.log("Da li je datum validan");
        return;
      }
    }
    { //Da li je dodata slika
      if (this.photo == null) {
        console.log("Da li je dodata slika");
        this.messageRow3 = "Unesite i sliku";
        return
      }
    }

    let k = 0;
    if (this.genre1 != "Zanr") this.genre[k++] = this.genre1;
    if (this.genre2 != "Zanr" && this.genre2!=this.genre1) this.genre[k++] = this.genre2;
    if (this.genre0 != "Zanr"  && this.genre0!=this.genre1  && this.genre2!=this.genre0) this.genre[k++] = this.genre0;
    let book: Book = {
      id: "", title: this.title,
      authors: this.authors, date: this.date,
      photo: this.photo, photoPath: "", description: this.description,
      genre: this.genre, rate: "0", valid: "false", numOfRate: "0"
    };
    this.servisBook.addBook(book,localStorage.getItem('token'));
    console.log("OK");
    this.initMessageError(); //SVe OK
  }

  ngOnDestroy() {
    this.servisSub.unsubscribe();
  }


  logOut() {
    this.servis.logOut(this.user.id);
  }


}
