import { Component, OnInit } from '@angular/core';
import { User } from 'Models/User';
import { Router } from '@angular/router';
import { RegistrationService } from '../registration.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  user: User;

  constructor(private router: Router, private regServis: RegistrationService) { }


  ngOnInit(): void {
    this.user= this.regServis.checkIfLoggedIn();
  }
  logOut(){
    //this.regServis.logOut();
  }
  ngOnDestroy(){
    this.logOut();
  }

}
