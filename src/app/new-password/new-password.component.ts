import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationService } from '../registration.service';
import { Subscription } from 'rxjs';
import { prepareSyntheticListenerFunctionName } from '@angular/compiler/src/render3/util';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {
  username: string;
  tokenMail: string;
  newPassword: string;
  newPassword2: string;

  messageRow1: string;
  messageRow2: string;

  private servisSub: Subscription;

  constructor(private acitvateRoute: ActivatedRoute,
    private servis: RegistrationService, private router: Router) { }

  initErrorMess() {
    this.messageRow1 = "";
    this.messageRow2 = "";
  }
  ngOnInit(): void {
    this.username = this.acitvateRoute.snapshot.paramMap.get('param');
    this.tokenMail = this.acitvateRoute.snapshot.paramMap.get('token');
    this.servisSub = this.servis.getSubjectToListen().subscribe(
      error => {
        if (error[0] == 'U') {
          this.messageRow2 = error;
          //ovde odradi delay promise sleep
          this.router.navigate(['login/newPassword']);
        }
        else
          if (error == "reset/istekaoToken") this.messageRow1 = "Vas token je istekao";
          else this.messageRow1 = "Molimo pokusajte ponovo";
        /* nisi hendovao sve GuardsCheckEnd.
         udji na link iz mejla juce i probaj da resetujes prepareSyntheticListenerFunctionName. Prvo promeni da stavljas
         password a ne hash pa onda resetuj*/
      }
    );
  }
  reset() {
    this.initErrorMess();
    if (this.newPassword == "" || this.newPassword == null) this.messageRow1 = "Unesite sifru";
    if (this.newPassword2 == "" || this.newPassword2 == null) this.messageRow2 = "Unesite sifru";
    if (this.messageRow1 != "" || this.messageRow2 != "") {
      console.log("reset()");
      return;
    }
    { //Da li je format lozinke i emaila dobar
      let lozinkaRegex = /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,})$/;
      if (!lozinkaRegex.test(this.newPassword)) {
        this.messageRow1 = "Lozinka je u losem formatu";
        return;
      }
    }
    if (this.newPassword != this.newPassword2) {
      this.messageRow2 = "Ispravno ponovite lozinku";
      return;
    }

    this.servis.resetPassword(this.newPassword2, this.tokenMail);
    this.initErrorMess();
  }
  ngOnDestroy(){
    this.servisSub.unsubscribe();
  }
}
