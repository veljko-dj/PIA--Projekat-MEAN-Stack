import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationService } from '../registration.service';
import { User } from 'Models/User';

@Component({
  selector: 'app-new-pass-logged',
  templateUrl: './new-pass-logged.component.html',
  styleUrls: ['./new-pass-logged.component.css']
})
export class NewPassLoggedComponent implements OnInit {

  user: User;

  oldPassword: string;
  newPassword: string;
  newPassword2: string;

  messageRow0: string;
  messageRow1: string;
  messageRow2: string;

  private servisSub: Subscription;

  constructor(private acitvateRoute: ActivatedRoute,
    private regServis: RegistrationService, private router: Router) { }

  initErrorMess() {
    this.messageRow0 = "";
    this.messageRow1 = "";
    this.messageRow2 = "";
  }
  ngOnInit(): void {
    this.user = this.regServis.checkIfLoggedIn();
    this.regServis.checkIfGuest(this.user);
    this.servisSub = this.regServis.getSubjectToListen().subscribe(
      error => {
        if (error == "logout/odjavljen") { this.router.navigate(['login/sessionExpired']); return }
        if (error == "logout/neuspesnaOdjava") console.log("logout/neuspesnaOdjava");
        else if (error == "reset/Uspesno") {
          this.messageRow2 = error;
          this.router.navigate(['login/newPassword']);
        }
        else
          if (error == "reset/istekaoToken") this.router.navigate(['login/sessionExpired']);
          else this.messageRow1 = "Molimo pokusajte ponovo";
      }
    );
  }
  newPass() {
    this.initErrorMess();
    if (this.oldPassword == "" || this.oldPassword == null) this.messageRow0 = "Unesite start sifru";
    if (this.newPassword == "" || this.newPassword == null) this.messageRow1 = "Unesite novu sifru";
    if (this.newPassword2 == "" || this.newPassword2 == null) this.messageRow2 = "Ponovite novu sifru";
    if (this.messageRow1 != "" || this.messageRow2 != "") {
      console.log("newPassword()");
      return;
    }
    { //Da li je format lozinke i emaila dobar
      let lozinkaRegex = /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,})$/;
      if (!lozinkaRegex.test(this.newPassword)) {
        this.messageRow1 = "Lozinka je u losem formatu";
        return;
      }
    }
    if (this.newPassword == this.oldPassword) {
      this.messageRow1 = "Uneli ste istu staru i novu lozinku";
      return;
    }
    if (this.newPassword != this.newPassword2) {
      this.messageRow2 = "Ispravno ponovite lozinku";
      return;
    }

    this.regServis.changePassword(this.newPassword, localStorage.getItem('token'));
    this.initErrorMess();
  }
  logOut() {
    this.regServis.logOut(this.user.id);
  }
  ngOnDestroy() {
    this.servisSub.unsubscribe();
  }
}
