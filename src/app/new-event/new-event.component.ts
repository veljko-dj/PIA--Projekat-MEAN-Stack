import { Component, OnInit } from '@angular/core';
import { User } from 'Models/User';
import { RegistrationService } from '../registration.service';
import { Subscription } from 'rxjs';
import { MatStepper } from '@angular/material/stepper'
import { EventService } from '../event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-event',
  templateUrl: './new-event.component.html',
  styleUrls: ['./new-event.component.css']
})
export class NewEventComponent implements OnInit {

  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  public: string = "yes";
  privateList: string[] = [];  //id i username
  active: string = "no";


  user: User;
  following: any[];

  completed1: boolean = false;
  completed2: boolean = false;
  completed3: boolean = false;
  completed4: boolean = false;
  messageError: string;



  private servisSub: Subscription;
  private regSub: Subscription;
  constructor(private regServis: RegistrationService, private eventServis: EventService,
    private router: Router) { }

  next1(stepper: MatStepper) {
    if (this.name == "" || this.name == null) {
      this.messageError = "Unesite naziv Vaseg dogadjaja";
      return;
    }
    this.completed1 = true;
    setTimeout(() => {           // or do some API calls/ Async events
      stepper.next();
    }, 1);
    this.messageError = "";
  }
  next2(stepper: MatStepper) {
    if (this.startDate == null) {
      this.messageError = "Unesite datum u budnosti";
      return;
    }
    this.startDate = new Date(this.startDate);
    if (this.startDate.getTime() < (new Date()).getTime()) {
      this.messageError = "Unesite datum koji je u buducnosti";
      return;
    }
    this.completed2 = true;
    setTimeout(() => {           // or do some API calls/ Async events
      stepper.next();
    }, 1);
    this.messageError = "";
  }
  next22(stepper: MatStepper) {
    this.startDate = new Date();
    this.active = "yes";
    this.next2(stepper);
  }
  next3(stepper: MatStepper) {
    if (this.endDate == null) {
      this.messageError = "Unesite datum u budnosti";
      return;
    }
    this.endDate = new Date(this.endDate);
    if (this.endDate.getTime() < this.startDate.getTime()) {
      this.messageError = "Vas digadjaj mora da se zavrsi posle pocetka";
      return;
    }
    this.completed3 = true;
    setTimeout(() => {           // or do some API calls/ Async events
      stepper.next();
    }, 1);
    this.messageError = "";
  }
  next33(stepper: MatStepper) {
    this.endDate = this.startDate;
    this.next3(stepper);
  }
  next4(stepper: MatStepper) {
    if (this.description == "" || this.description == null) {
      this.messageError = "Unesite opis Vaseg dogadjaja";
      return;
    }
    this.completed4 = true;
    setTimeout(() => {           // or do some API calls/ Async events
      stepper.next();
    }, 1);
    this.messageError = "";
  }
  next5(stepper: MatStepper) {
    /*if (this.public == "no" && (this.privateList == null || this.privateList.length == 0)) {
      this.messageError = "Dogadjaj bez  gostiju nema poentu";
      return;
    }*/
    this.privateList.push(this.user.id + "DELIMG" + this.user.username);
    this.eventServis.addEvent({
      public: this.public,
      description: this.description,
      dateEnd: this.endDate.toLocaleDateString(),
      dateStart: this.startDate.toLocaleDateString(),
      guests: this.privateList.toString(),
      name: this.name,
      valid: "false",
      id: "", active:  "yes"

    },localStorage.getItem('token'))
    console.log(this.privateList);
    this.messageError = "";
    this.active = "no";
  }

  ngOnInit() {
    this.user = this.regServis.checkIfLoggedIn();
    this.regServis.checkIfGuest(this.user);
    this.regSub = this.regServis.getSubjectToListen().subscribe(
      status => {
        if (status.split('/')[0] == "getFollowingForUserId") {

          if (status.split('/')[1] == "neuspesno") console.log("Greska pri dohvatanju onih koje pratim")
          else this.following = JSON.parse(status.split("DELIMITER")[1]);
          //console.log(this.following);
        }
      }
    );
    this.servisSub = this.eventServis.getSubjectToListen().subscribe(
      status => {
        if (status.split('/')[0] == "addEvent") {
          if (status == "addEvent/neuspesno") this.messageError = "Molimo pokusajte ponovo";
          else this.router.navigate(["allEvents"]);

        }
      }
    );
    this.regServis.getFollowingForUserId(this.user.id);
  }
  logOut() {
    this.regServis.logOut(this.user.id);
  }
}
