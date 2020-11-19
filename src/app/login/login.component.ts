import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '../registration.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { User } from 'Models/User';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private servisSub: Subscription;

  messageFromAnotherComp: string;

  username: string;
  pass: string;

  messageRow1: string;
  messageRow2: string;

  constructor(private servis: RegistrationService, private acitvateRoute: ActivatedRoute) { }

  setMessageError() {
    this.messageRow1 = "";
    this.messageRow2 = "";
  }
  privremeniUlazniPodaci() {
    this.pass = "Lozinka123!";
  }
  messageFromAnotherComponent() {
    this.messageFromAnotherComp = this.acitvateRoute.snapshot.paramMap.get('jumpFrom');
    if (this.messageFromAnotherComp == "newPassword") this.messageFromAnotherComp = "Uspesno ste promenili lozinku!";
    else if (this.messageFromAnotherComp == "notLoggedIn") this.messageFromAnotherComp = "Molimo Vas prijavite se ponovo.";
    else if (this.messageFromAnotherComp == "sessionExpired") this.messageFromAnotherComp = "Istekla vam je sesija";

  }
  ngOnInit(): void {
    this.messageFromAnotherComponent();
    this.privremeniUlazniPodaci();
    this.setMessageError();
    this.servisSub = this.servis.getSubjectToListen().subscribe(
      error => {
        //PRoveri da li radi
        if (error == "login/pogresnaSifra") this.messageRow2 = "Pogresno uneta sifra";
        else if (error == "login/nePostoji") this.messageRow2 = "Ne postoji korisnik";
        else if (error == "login/cekaj") this.messageRow2 = "Vas nalog jos nije odobren";
        else if (error == "login/odbijen") this.messageRow2 = "Vas nalog je odbijen";
        else this.messageRow2 = "Molimo pokusajte ponovo";
      }
    );
  }
  login() {
    this.setMessageError();
    if (this.username == "" || this.username == null) this.messageRow1 = "Unesite korisnicko ime";
    if (this.pass == "" || this.username == null) this.messageRow2 = "Unesite lozinku";
    if (!(this.messageRow1 == "" && this.messageRow2 == "")) {
      console.log("Nisu uneti podaci");
      return;
    }
    this.servis.login(this.username, this.pass);
    this.setMessageError();
  }
  continueAsGuest() {
    let user: User = {
      date: new Date(),
      email: "", password: "", type: "guest",
      username: "", photo: null,
      id: "", photoPath: "",
      name: "", surname: "", town: "",
      notification: ""
    }
    localStorage.setItem('user', JSON.stringify(user));
  }
  ngOnDestroy() {
    this.servisSub.unsubscribe();
  }
}
