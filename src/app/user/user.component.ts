import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'Models/User';
import { Router, ActivatedRoute } from '@angular/router';
import { RegistrationService } from '../registration.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Comment } from 'Models/Comm'
import { Book } from 'Models/Book';
import { ReadBook } from 'Models/ReadBook';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {

  user: User;
  me: boolean = true;
  meType: string = "admin";

  //dodato 17.09.2020 samo da sacuvas LocalStorage korektno jer ga negde menjas
  // pa da ne trazis sada
  callbackUser: User;

  follow: boolean = false;


  editName: boolean;
  editSurname: boolean;
  editDate: boolean;
  editTown: boolean;
  editPhoto: boolean;
  messageError: string;
  newDate: Date;
  newPhoto: File;
  newPhotoURL: string;
  lastSeen: string;



  //paggination
  allComments: Comment[];
  showComments: boolean = false;
  allCommentsLength: number = 30;
  commPerPage: number = 2;
  currentCommPage: number = 1;
  pageSizeOptions: number[] = [1, 2, 3];


  wishlist: ReadBook[];
  showWishlist: boolean = false;
  allWishlistLength: number = 30;
  wishlistPerPage: number = 2;
  currentWishlistPage: number = 1;

  read: ReadBook[];
  showRead: boolean = false;
  allReadLength: number = 30;
  readPerPage: number = 2;
  currentReadPage: number = 1;

  reading: ReadBook[];
  showReading: boolean = false;
  allReadingLength: number = 30;
  readingPerPage: number = 2;
  currentReadingPage: number = 1;


  notifications: string;


  // Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = ['Download', 'Sales', 'Mail Sales'];
  public pieChartData: SingleDataSet = [3, 5, 1];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [{
    datalabels: {
      formatter: (value, ctx) => {
        let percentage;
        let datasets = ctx.chart.data.datasets;
        if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
          let sum = datasets[0].data.reduce((a, b) => a + b, 0);
          percentage = Math.round((value / sum) * 100) + '%';
          return percentage;
        } else {
          return percentage;
        }
      },
      color: '#fff',
    }
  }];





  private servisSub: Subscription;

  constructor(private router: Router, private regServis: RegistrationService, private activateRoute: ActivatedRoute) {
    monkeyPatchChartJsTooltip();
  }


  initEditBoolean() {
    this.editName = false;
    this.editSurname = false;
    //this.editUsername=false;
    this.editDate = false;
    //this.editEmail=false;
    this.editTown = false;
    this.editPhoto = false;
    this.messageError = "";
  }
  checkLastSeen() {
    this.regServis.lastSeen(this.user.id);
  }
  checkIfItIsMe() {
    this.callbackUser = this.user;
    let id = this.activateRoute.snapshot.paramMap.get('id');
    //console.log(id);
    if (id == this.user.id || id == null) {
      this.me = true;
      this.notifications = (this.user.notification.split('DELLBOOKCOMM')).toString();
    }
    else {
      console.log(id);
      console.log(this.user.id);
      this.regServis.doesFollow(this.user.id, id);
      console.log("To nisam ja");
      this.user.id = id;
      this.me = false;
      this.meType = this.user.type;
      this.regServis.searchUserById(id);
    }

  }
  getComments() {
    this.regServis.getCommentsByUserId(this.user.id, this.commPerPage, this.currentCommPage);
  }
  getWishlistList() {
    this.regServis.getBooksByUserId(this.user.id, "wishlist", this.wishlistPerPage, this.currentWishlistPage);
  }
  getReadList() {
    this.regServis.getBooksByUserId(this.user.id, "readd", this.readPerPage, this.currentReadPage);
  }
  getReadingList() {
    this.regServis.getBooksByUserId(this.user.id, "reading", this.readingPerPage, this.currentReadingPage);
  }
  deleteFromReadBook(idBook: string) {
    this.regServis.deleteReadBook(this.user.id, idBook, localStorage.getItem('token'));
    for (var i = 0; i < this.wishlist.length; i++) {
      if (this.wishlist[i].idBook == idBook && this.user.id == this.wishlist[i].idUser) {
        this.wishlist.splice(i, 1);
      }
    }
    if (this.wishlist.length == 0) this.allWishlistLength = 0;
  }
  updatePieChart(read: ReadBook[]) {
    let sum = 0;
    let mapa = new Map<string, number>();
    read.forEach(function (value) {
      let nizZ = value.genre.split(',');
      nizZ.forEach(element => {
        let x = 1;
        if (mapa.has(element)) {
          x = mapa.get(element);
          x++;
        }
        sum++;
        mapa.set(element, x);
      });
    });
    this.pieChartLabels = Array.from(mapa.keys());
    let tmp = Array.from(mapa.values());
    tmp.forEach(function (part, index) {
      this[index] = 100 * this[index] / sum;
    }, tmp);
    this.pieChartData = tmp;
  }

  ngOnInit(): void {
    this.initEditBoolean();
    this.user = this.regServis.checkIfLoggedIn();
    this.meType = this.user.type;
    console.log(this.user);
    this.regServis.checkIfGuest(this.user);
    this.servisSub = this.regServis.getSubjectToListen().subscribe(
      error => {
        //console.log(error);
        if (error == "user/validateUser/uspesno") console.log("Ovde je stajalo ovo desno");//localStorage.setItem('user', JSON.stringify(this.user));
        else if (error == "doesFollow/uspesno/yes") this.follow = true;
        else if (error == "doesFollow/uspesno/no") this.follow = false;
        else if (error == "doesFollow/neuspesno") console.log("neuspesno dohvatanje da li prati");
        else
          if (error.split('/')[0] == "searchUserById") {
            //console.log(error);
            if (error.split('/')[1] == "neuspesno") console.log("Greska pri ucitavanju korisnika po idu");
            else {
              let a = JSON.parse(error.split("DELIMITER")[1]);
              console.log(a);
              console.log("____");
              console.log(this.user);
              this.user = a;
              this.user.photoPath = a.imagePath;
              this.user.id = a._id;
              this.user.type = a.userType;
            }
          } else
            if (error.split('/')[0] == "getAllReadBooksByUser") {
              this.updatePieChart(JSON.parse(error.split("DELIMITER")[1]));
            } else
              if (error.split('/')[0] == "getCommsByUser") {
                if (error.split('/')[1] == "neuspesno") console.log("Greska pri ucitavnju komentara");
                else {
                  this.allCommentsLength = parseInt(error.split("DELIMITER")[2]);
                  if (this.allCommentsLength > 0)
                    this.allComments = JSON.parse(error.split('DELIMITER')[1]);
                  else this.allComments = [];
                  //console.log(this.allComments.length);
                }
              } else if (error.split('/')[0] == "getBooksByUser") {
                //console.log("Getbooks");
                if (error.split('/')[1] == "neuspesno") console.log("Greska pri ucitavnju knjiga");
                else {
                  let tip = error.split("DELIMITER")[1];
                  //console.log(tip);
                  if (tip == "wishlist") {
                    this.allWishlistLength = parseInt(error.split("DELIMITER")[3]);
                    if (this.allWishlistLength > 0)
                      this.wishlist = JSON.parse(error.split("DELIMITER")[2]);
                    else this.wishlist = [];
                  } else
                    if (tip == "readd") {
                      this.allReadLength = parseInt(error.split("DELIMITER")[3]);
                      if (this.allReadLength > 0)
                        this.read = JSON.parse(error.split("DELIMITER")[2]);
                      else this.read = [];
                    } else
                      if (tip == "reading") {
                        this.allReadingLength = parseInt(error.split("DELIMITER")[3]);
                        if (this.allReadingLength > 0)
                          this.reading = JSON.parse(error.split("DELIMITER")[2]);
                        else this.reading = [];
                      }
                }
              } else {
                if ((error.split('/')[0]) == "lastSeen") {
                  this.lastSeen = error.split('DELIMITER')[1];
                  if (this.lastSeen == "undefined") this.lastSeen = "Nije ulazio"
                }
                if (error == "logout/odjavljen") { this.router.navigate(['login/sessionExpired']); return }
                if (error == "logout/neuspesnaOdjava") console.log("logout/neuspesnaOdjava");
                else if (error == "update/istekaoToken") this.router.navigate(['login/sessionExpired']);
                else if (error == "update") this.messageError = "Molimo pokusajte ponovo";
                else if (error == "update/uspesnoApdejtovan") {
                  localStorage.setItem('user', JSON.stringify(this.user));
                  this.user = this.regServis.checkIfLoggedIn();
                  window.location.reload();
                }
              }
      }
    );
    this.checkIfItIsMe();
    this.checkLastSeen();
    this.getComments();
    this.getWishlistList();
    this.getReadList();
    this.getReadingList();
    this.regServis.getBooksByUserId(this.user.id, "readd", 0, 0);
  }
  logOut() {
    this.regServis.logOut(this.user.id);
  }
  checkPhoto(event: Event) {
    //console.log("checkPhoto");
    this.newPhoto = (event.target as HTMLInputElement).files[0];

    //console.log(this.photo);
    const reader = new FileReader();
    reader.onload = () => {
      this.newPhotoURL = reader.result as string;
      //console.log(this.photoURL);
    }
    reader.readAsDataURL(this.newPhoto);
  }
  changeEdit(a: string) {
    if (a == "Name") this.editName = (!this.editName);
    if (a == "Surname") this.editSurname = (!this.editSurname);
    //if (a=="Username") this.editUsername=(!this.editUsername);
    if (a == "Date") {
      this.editDate = (!this.editDate);
      let tmpDate = new Date(this.newDate);
      if (this.editDate == false) {
        if (this.newDate && (tmpDate.getTime() < (new Date()).getTime())) {
          this.user.date = tmpDate;
          this.messageError = "";
        }
        else {
          this.messageError = "Unesite validan datum";
          this.editDate = (!this.editDate);
        }
      }
    }
    //if (a=="Email") this.editEmail=(!this.editEmail);
    if (a == "Town") this.editTown = (!this.editTown);
    if (a == "Photo") {
      this.editPhoto = !this.editPhoto;
      if (this.editDate == false) {
      }
    }
  }
  update() {
    if (!this.editDate && !this.editName && !this.editPhoto
      && !this.editSurname && !this.editTown)
      this.regServis.updateUser(this.user, localStorage.getItem('token'));
  }
  updatePhoto() {
    this.regServis.updateUserPhoto(this.newPhoto, this.user, localStorage.getItem('token'));
  }
  followUser() {
    this.regServis.followUser(JSON.parse(localStorage.getItem('user')).id, JSON.parse(localStorage.getItem('user')).username, this.user.id, this.user.username);
    this.follow = true;
  }
  unfollowUser() {
    this.regServis.unfollowUser(JSON.parse(localStorage.getItem('user')).id, this.user.id);
    this.follow = false;
  }
  validateUser() {
    this.regServis.validateUser(this.user.id, "user", localStorage.getItem('token'));
    this.user.type = "user";
  }
  validateUserToModerator() {
    this.regServis.validateUser(this.user.id, "moderator", localStorage.getItem('token'));
    this.user.type = "moderator";
  }
  onChangePage(pageEvent: PageEvent) {
    //console.log(pageEvent);
    this.currentCommPage = pageEvent.pageIndex + 1;
    this.commPerPage = pageEvent.pageSize;
    this.regServis.getCommentsByUserId(this.user.id, this.commPerPage, this.currentCommPage);
  }
  onChangePageRead(pageEvent: PageEvent) {
    //console.log(pageEvent);
    this.currentReadPage = pageEvent.pageIndex + 1;
    this.readPerPage = pageEvent.pageSize;
    this.getReadList();
  }
  onChangePageWishlist(pageEvent: PageEvent) {
    //console.log(pageEvent);
    this.currentWishlistPage = pageEvent.pageIndex + 1;
    this.wishlistPerPage = pageEvent.pageSize;
    this.getWishlistList();
  }
  onChangePageReading(pageEvent: PageEvent) {
    //console.log(pageEvent);
    this.currentReadingPage = pageEvent.pageIndex + 1;
    this.readingPerPage = pageEvent.pageSize;
    this.getReadingList();
  }
  ngOnDestroy() {

    //debugger
    //console.log("onDestroy");
    //LocalStorage.setItem('konj', this.callbackUser.toString());
    //this.logOut();
    // if (!this.me) localStorage.setItem('user',  JSON.stringify(this.callbackUser));
  }
  skok(link: string) {
    this.router.navigate([link]);
  }
}
