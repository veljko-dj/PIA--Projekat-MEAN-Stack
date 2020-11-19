import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '../registration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookService } from '../book.service';
import { User } from 'Models/User';

@Component({
  selector: 'app-new-genre',
  templateUrl: './new-genre.component.html',
  styleUrls: ['./new-genre.component.css']
})
export class NewGenreComponent implements OnInit {
  user: User;

  newGenre: string;

  messageRow1: string;
  message: string;

  deleteGenre: string = "Zanr";
  genres: any[] = [];

  private servisSub: Subscription;

  constructor(private acitvateRoute: ActivatedRoute,
    private servisBook: BookService, private router: Router,
    private regServis: RegistrationService) { }

  initErrorMess() {
    this.messageRow1 = "";
  }
  ngOnInit(): void {
    this.user = this.regServis.checkIfLoggedIn();
    this.servisSub = this.servisBook.getSubjectGenreToListen().subscribe(
      res => {
        if (res == "genre/uspesno") {
          this.message = "Uspesno dodato";
          this.servisBook.getGenres();
        }
        else if (res == "genre/postoji") this.messageRow1 = "Vec postoji zanr"
        else if (res == "genre") console.log("Neuspesno dohvatanje Zanrova");
        else if (res == "genre/delete/uspesno") { this.message = "Uspesno obrisan"; this.servisBook.getGenres(); }
        else if (res == "genre/delete/neuspesno/postoji") this.messageRow1 = "Zanr se koristi";
        else {
          this.genres = JSON.parse(res);
        }
      }
    );
    this.servisBook.getGenres();
    let a = localStorage.getItem('user');
    if (a) {
      let u: User = JSON.parse(a);
      if (u.type != "admin") {
        if (u.type == "guest") this.router.navigate(["guest"]);
        else if (u.type == "") this.router.navigate(["login"]);
        else this.router.navigate(["user"])
      }
    } else this.router.navigate([""]);
  }
  addGenre() {
    if (this.newGenre == "" || this.newGenre == null) {
      this.messageRow1 = "Unesite naziv";
      return;
    }
    this.servisBook.addGenre(this.newGenre.toLowerCase(),localStorage.getItem('token'));
  }
  deleteGenree() {
    this.message = "";
    this.messageRow1 = "";
    if (this.deleteGenre == null || this.deleteGenre == "Zanr") {
      this.messageRow1 = "Odaberi prvo neki";
      return;
    }
    this.servisBook.deleteGenre(this.deleteGenre,localStorage.getItem('token'));
  }
  logOut() {
    this.regServis.logOut(this.user.id);
  }
  ngOnDestroy() {
  }
}
