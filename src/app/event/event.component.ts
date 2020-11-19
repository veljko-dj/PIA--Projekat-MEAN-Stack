import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventMy } from "Models/Event";
import { EventComment } from "Models/EventComm";
import { User } from 'Models/User';
import { RegistrationService } from '../registration.service';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {

  user: User;
  showToUser: boolean = false;
  showEverything: boolean = false;

  event: EventMy;
  creator: { id: string, username: string } = { id: "", username: "" };
  isActive: boolean;

  allComments: EventComment[] = [];
  messageAllComms: string = "";
  showComments: boolean = false;

  allRequests: EventComment[] = [];
  messageAllReqs: string = "";
  acceptedRequests: string[] = [];

  messageSendReq: string = "";

  comm: string;
  messageCommError: string;

  disableButton: boolean = false; //ovo si nabudzio na kraju kad si skontao da ti stoji dugme stalno

  private sub: Subscription;
  private socket = io('http://localhost:3001');
  constructor(private activateRoute: ActivatedRoute, private eventServis: EventService, private regServis: RegistrationService) {

    this.eventServis.newMessageReceived().subscribe(data => {
      //console.log("newMessageRecived: u event.component.ts");
      this.getComments();
    });
  }

  getEventInfo() {
    let id = this.activateRoute.snapshot.paramMap.get('id');
    this.eventServis.getEventById(id);
  }
  checkActive() {
    this.isActive = false;
    let start = new Date(this.event.dateStart);
    let end = new Date(this.event.dateEnd);
    let now = new Date();
    if (start.getTime() > now.getTime() || (end.getTime() < now.getTime() && end.getTime() != start.getTime())) this.disableButton = true;
    if (start.getTime() > now.getTime()) return;
    if (end.getTime() < now.getTime() && end.getTime() != start.getTime()) return;

    if (this.event.active == 'no') return;
    this.isActive = true;
  }
  openEvent() {
    //if (this.event.active != "yes") { OVO SI NAKNADNO MENJAO KAD SI DODAVAO SESIJU. AKO NE RADI VIDI STA SE DESAVA
    this.event.active = "yes";
    this.eventServis.updateEventActiveAndValidById(this.event.id, this.event.active, this.event.valid, localStorage.getItem('token'));
    //}
  }
  closeEvent() {
    //if (this.event.active != "no") {  OVO SI NAKNADNO MENJAO KAD SI DODAVAO SESIJU. AKO NE RADI VIDI STA SE DESAVA
    this.event.active = "no";
    this.eventServis.updateEventActiveAndValidById(this.event.id, this.event.active, this.event.valid, localStorage.getItem('token'));
    //}
  }
  checkIfUserCanAttendThisEvent() {
    let niz: string[] = this.event.guests.split(',');

    if (this.user.id == this.creator.id) {
      this.showToUser = true;
      this.showEverything = true;
      this.eventServis.getRequestForByEventId(this.event.id);
      return;
    } else this.showEverything = false;
    //console.log(niz);
    if (niz.find(elem => (this.user.id == elem.split("DELIMG")[0])) || this.event.public == "yes") this.showToUser = true;
    else this.showToUser = false;
  }

  getComments() {
    this.eventServis.getCommentsByEventId(this.event.id);
  }
  addComment() {
    if (this.comm == "") {
      this.messageCommError = "Morate uneti komentar i ocenu";
      return;
    }
    if (this.comm.length > 100) {
      this.messageCommError = "Komentar mora biti manji od 100 karaktera";
      return;
    }
    //ovde token prosledjujes
    this.eventServis.addComment(this.user.id, this.event.id, this.comm, this.user.username, "comment", localStorage.getItem('token'));
    this.messageCommError = "";
    this.comm = "";
  }
  acceptReq() {
    this.messageAllReqs = "Niste nikoga odabrali";
    if (this.acceptedRequests == null || this.acceptedRequests.length == 0)
      return;
    this.eventServis.acceptRequests(this.event.id, this.acceptedRequests.toString(), localStorage.getItem('token')); this.messageAllReqs = "";

    this.messageAllReqs = "";
    //this.checkIfUserCanAttendThisEvent();
  }
  sendReq() {
    this.eventServis.addComment(this.user.id, this.event.id, "dodatne info", this.user.username, "request", localStorage.getItem('token'));
    this.messageSendReq = "Poslali ste zahtev";
  }
  neograniceno(): boolean {
    if (((new Date(this.event.dateEnd)).getTime() == (new Date(this.event.dateStart)).getTime())) return true;
    else return false;
  }

  ngOnInit(): void {
    this.user = this.regServis.checkIfLoggedIn();
    this.sub = this.eventServis.getSubjectToListen().subscribe(
      status => {
        if (status.split('/')[0] == "getEventById") {
          if (status == "getEventById/neuspesno") console.log("Greska pri dohvatanju dogadjaja");
          else {
            //console.log("status: "+ JSON.parse(status.split("DELIMITER")[1]));
            this.event = JSON.parse(status.split("DELIMITER")[1]);
            this.event.id = JSON.parse(status.split("DELIMITER")[1])._id;
            let niz: string[] = this.event.guests.split(',');
            this.creator.id = niz[niz.length - 1].split("DELIMG")[0];
            this.creator.username = niz[niz.length - 1].split("DELIMG")[1];
            this.checkActive();
            this.getComments();
            this.checkIfUserCanAttendThisEvent();
            this.eventServis.joinRoom({ idEvent: this.event.id });
            //console.log(this.allComments);
          }
        }
        else if (status.split('/')[0] == "updateActiveAndValid") {
          if (status == "updateActiveAndValid/neuspesno") console.log("Greska pri zatv/otv dogadjaja");
          else this.checkActive();
        }
        else if ((status.split('/')[0]) == "getAllComments") {
          if (status.split('/')[1] == "neuspesno") console.log("nesupesno dohvatanje komentara");
          else {
            this.allComments = JSON.parse(status.split('DELIMITER')[1]);
            if (this.allComments.length == 0) this.messageAllComms = "Nema komentara za ovu knjigu";
            //console.log(this.allComments);
          }
        }
        else if ((status.split('/')[0]) == "addComment") {
          if (status.split('/')[1] == "neuspesno") console.log("nesupesno dodavanje komentara ili zahteva");
          else {
            this.getComments();
            this.eventServis.sendMessage( { idEvent: this.event.id });
          }
        }
        else if ((status.split("/")[0]) == "getAllRequests") {
          if (status.split('/')[1] == "neuspesno") console.log("nesupesno dohvatanje zahteva ");
          else {
            this.allRequests = JSON.parse(status.split('DELIMITER')[1]);
            if (this.allRequests.length == 0) this.messageAllReqs = "Nema trenutnih zahteva";
            //console.log(this.allComments);
          }
        } if (status == "acceptRequests/uspesno") {
          console.log("uspesno");
          this.checkIfUserCanAttendThisEvent();
        }
      });
    this.getEventInfo();
  }

  logOut() {
    this.regServis.logOut(this.user.id);
  }
}
