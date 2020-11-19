import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '../registration.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.component.html',
  styleUrls: ['./forgot-pass.component.css']
})
export class ForgotPassComponent implements OnInit {

  private servisSub: Subscription;

  email: string;
  message: string;

  messageRow1: string;

  constructor(private servis: RegistrationService) { }

  ngOnInit(): void {
    this.message = "";
    this.servisSub = this.servis.getSubjectToListen().subscribe(
      error => {
        if (error[0] == 'B') this.message = error;
        else if (error == "check/nePostoji") this.messageRow1 = "Korisnik sa tim emailom ne postoji";
        else this.messageRow1 = "Molimo pokusajte ponovo";
      }
    );
  }
  send() {
    this.messageRow1 = "";
    if (this.email == "" || this.email == null) {
      this.messageRow1 = "Morate uneti email";
      return;
    }
    this.servis.checkUserAndSend(this.email);

  }

  ngOnDestroy(){
    this.servisSub.unsubscribe();
  }

}
