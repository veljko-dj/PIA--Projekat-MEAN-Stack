import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { EventMy } from 'Models/Event';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class EventService implements OnInit {

  private subj = new Subject<string>();
  private socket = io('http://localhost:3001');


  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {

  }

  addEvent(ev: EventMy, token: string) {
    this.http
      .post<{
        message: string,
        id: string
      }>(
        "http://localhost:3000/event/add", {
        name: ev.name,
        dateStart: ev.dateStart,
        dateEnd: ev.dateEnd,
        description: ev.description,
        public: ev.public,
        guests: ev.guests,
        valid: ev.valid,
        active: ev.active,
        token: token
      })
      .subscribe(response => {
        this.subj.next("addEvent/uspesno/DELIMITER" + response.id);
      }, error => {
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        this.subj.next("addEvent/neuspesno");
      });
  }

  getEventById(id1: string) {
    this.http
      .post<{
        event: string
      }>("http://localhost:3000/event/getById", { id: id1 })
      .subscribe(response => {
        //console.log(response.rate);
        //console.log("sserv: " + JSON.parse(response.event));
        //console.log("sserv: " + response.event);
        this.subj.next("getEventById/uspesno/DELIMITER" + response.event);
      }, error => {
        this.subj.next("getEventById/neuspesno");
      });
  }
  getAllEvents() {
    this.http
      .post<{
        events: string
      }>("http://localhost:3000/event/getAllEvents", {})
      .subscribe(response => {
        this.subj.next("getAllEvents/uspesno/DELIMITER" + response.events);
      }, error => {
        this.subj.next("getAllEvents/neuspesno");
      });
  }
  getCommentsByEventId(id: string) {
    this.http
      .post<{
        status: number,
        comments: string //ovaj string je JSON
      }>("http://localhost:3000/event/getAllComments", { idEvent: id, type: "comment" })
      .subscribe(response => {
        if (response.status == 403) this.subj.next("getAllComments/neuspesno");
        else this.subj.next("getAllComments/uspesno/DELIMITER" + response.comments);
      }, error => {
        this.subj.next("getAllComments/neuspesno");
      });
  }
  getRequestForByEventId(id: string) {
    this.http
      .post<{
        status: number,
        comments: string //ovaj string je JSON
      }>("http://localhost:3000/event/getAllComments", { idEvent: id, type: "request" })
      .subscribe(response => {
        if (response.status == 403) this.subj.next("getAllRequests/neuspesno");
        else this.subj.next("getAllRequests/uspesno/DELIMITER" + response.comments);
      }, error => {
        this.subj.next("getAllRequests/neuspesno");
      });
  }
  acceptRequests(idEvent: string, requ: string, token: string) {
    console.log(requ);
    this.http
      .post<{
        status: number,
        comments: string //ovaj string je JSON
      }>("http://localhost:3000/event/acceptRequests", { idEvent: idEvent, requests: requ , token: token})
      .subscribe(response => {
        this.subj.next("acceptRequests/uspesno");
      }, error => {
        console.log("acceptRequests/neuspesno");
        this.subj.next("acceptRequests/neuspesno");
      });
  }
  addComment(idUser: string, idEvent: string, comm: string, username: string, type: string, token: string) {
    this.http
      .post(
        "http://localhost:3000/event/addComment", {
        idUser: idUser,
        idEvent: idEvent,
        comment: comm,
        username: username,
        type: type,
        token: token
      })
      .subscribe(response => {
        this.subj.next("addComment/uspesno");
      }, error => {
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        this.subj.next("addComment/neuspesno");
      });
  }

  updateEventActiveAndValidById(id: string, active: string, valid: string, token: string) {
    this.http
      .post("http://localhost:3000/event/updateActiveAndValid", { id: id, active: active, valid: valid, token: token })
      .subscribe(response => {
        //console.log(response.rate);
        this.subj.next("updateActiveAndValid/uspesno");
        console.log("Uspesno");
      }, error => {
        console.log("neUspesno");
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        else this.subj.next("updateActiveAndValid/neuspesno");
      });
  }
  getSubjectToListen() {
    return this.subj.asObservable();
  }

  newMessageReceived() {
    //console.log("Message recieved : u service.ts");
    const observable = new Observable<{idEvent: String}>(observer => {
      this.socket = io('http://localhost:3001');
      this.socket.on('new message', (data) => {
        //console.log("xxx");
        observer.next(data);
      });
      return () => {
        //console.log("yyy");
        this.socket.disconnect();
      };
    });
    return observable;
  }
  joinRoom(data) {
    //console.log(data);
    this.socket.emit('join', data);
  }
  sendMessage(data) {
    this.socket.emit('message', data);
  }
}
