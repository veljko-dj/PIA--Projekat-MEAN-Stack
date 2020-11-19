import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RegistrationService } from '../registration.service';
import { EventService } from '../event.service';
import { Router } from '@angular/router';
import { User } from 'Models/User';
import { EventMy } from 'Models/Event';

@Component({
  selector: 'app-all-events',
  templateUrl: './all-events.component.html',
  styleUrls: ['./all-events.component.css']
})
export class AllEventsComponent implements OnInit {


  user: User;
  message: string = "";

  events: EventMy[];

  private servisSub: Subscription;
  constructor(private regServis: RegistrationService, private eventServis: EventService,
    private router: Router) { }

  createArrayOfEvents(status: string) {
    let a = JSON.parse(status.split("DELIMITER")[1]);
    this.events = a;
    for (var _i = 0; _i < this.events.length; _i++) {
      this.events[_i].id = a[_i]._id;
    }
    if (this.events.length == 0) {
      this.message = "Ne postoji ni jedan dogadjaj";
      this.events = null;
    }
    else this.message = "";
    if (this.user.type == "guest")
      this.filterForGuest();
  }
  ngOnInit(): void {
    this.user = this.regServis.checkIfLoggedIn();
    this.servisSub = this.eventServis.getSubjectToListen().subscribe(
      status => {
        if (status.split('/')[0] == "getAllEvents") {
          if (status.split('/')[1] == "neuspesno") console.log("Greska pri dohvatanju svih dogadjaja")
          else {
            this.createArrayOfEvents(status);
            /*console.log(status)
            let a = status.split("DELIMITER")[1];
            console.log(a);
            this.events = JSON.parse(a);
            console.log(this.events);
            this.events.forEach(function (part, index) {
              //this[index] = a[index]._id;
            }, this.events);
            if (this.events.length == 0) this.message = "Ne postoji ni jedno desavanje";
            console.log(this.events);*/
          }
        }

      }
    );
    this.eventServis.getAllEvents();
  }
  filterForGuest() {
    console.log("EEEE");
    console.log(this.events);
    console.log(this.events.length);
    let niz: number[] = [];
    this.events.forEach((element, index) => {
      console.log("i" + index);
      console.log(element.name);
      let start = new Date(element.dateStart);
      let end = new Date(element.dateEnd);
      let now = new Date();
      if (element.public == "no" || element.active == "no") {
        niz.unshift(index);
      }
      else {
        if (now.getTime() > start.getTime())
          if (start.getTime() != end.getTime())
            if (now.getTime() > end.getTime()) {
              niz.unshift(index);
            }
      }
    });
    console.log(niz);
    niz.forEach(element => {
      this.events.splice(element, 1);
    });
    console.log("AAAA");
    console.log(this.events);
    this.events.forEach((element, index) => {
      let start = new Date(element.dateStart);
      let now = new Date();
      if (now.getTime() > start.getTime())
        element.dateStart = "Aktivno";
    });
  }
  neograniceno(endS: string, startS: string): boolean {
    if (((new Date(endS)).getTime() == (new Date(startS)).getTime())) return true;
    else return false;
  }
  logOut() {
    this.regServis.logOut(this.user.id);
  }
}
