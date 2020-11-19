import { Component, OnInit } from '@angular/core';
import { User } from 'Models/User';
import { Router } from '@angular/router';
import { RegistrationService } from '../registration.service';

@Component({
  selector: 'app-guest',
  templateUrl: './guest.component.html',
  styleUrls: ['./guest.component.css']
})
export class GuestComponent implements OnInit {
  user: User;

  constructor( private router: Router, private regS: RegistrationService) { }

  ngOnInit(): void {
    this.user= this.regS.checkIfLoggedIn();
    if ( this.user && this.user.type=="guest") return;
    this.router.navigate(["login"]);
  }
  ngOnDestroy() {
    //logout();
  }

}
