import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'Models/User';
import { RegistrationService } from '../registration.service';
import { BookService } from '../book.service';

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.css']
})
export class SearchUserComponent implements OnInit {
  user: User;

  searchName: string = "";
  searchSurname: string = "";
  searchUsername: string = "";
  searchEmail: string = "";
  message: string;

  searchedUsers: User[];


  private servisRegSub: Subscription;


  constructor(private regServis: RegistrationService) { }

  initSearch() {
    this.searchName = "";
    this.searchSurname = "";
    this.searchUsername = "";
    this.searchEmail = "";
  }
  createArrayOfUsers(status: string) {
    console.log(status);
    let statusss= status.split("DELIMITER")[1]
    let a = JSON.parse(statusss);
    this.searchedUsers = a;
    for (var _i = 0; _i < this.searchedUsers.length; _i++) {
      this.searchedUsers[_i].id = a[_i]._id;
      this.searchedUsers[_i].photoPath= a[_i].imagePath;
    }
    if (this.searchedUsers.length == 0) {
      this.message = "Nema korisnika po zadatom krijeterijumu";
      this.searchedUsers=null;
    }
    else this.message = "";
  }
  ngOnInit(): void {
    this.initSearch();
    this.user = this.regServis.checkIfLoggedIn();
    this.regServis.checkIfGuest(this.user);
    this.servisRegSub = this.regServis.getSubjectToListen().subscribe(
      status => {
        if (status.split("/")[1] == "searchUser") {
          if (status.split("/")[2] == "neuspesno") this.message = "Neuspesna pretraga. Molimo pokusajte ponovo";
          else {
            this.createArrayOfUsers(status);
          }
        }
      }
    )
  }

  searchBook() {
    /*console.log(this.searchGenre);
    console.log(this.searchAuthor);
    console.log(this.searchName);*/
    if (this.searchName == "" && this.searchSurname == "" && this.searchUsername == "" && this.searchEmail=="") {
      this.message = "Morate pretrazivati bar po jednom kriterijumu";
      return;
    }
    if (this.searchName == "") this.searchName = ".";
    if (this.searchSurname == "") this.searchSurname = ".";
    if (this.searchUsername == "") this.searchUsername = ".";
    if (this.searchEmail == "") this.searchEmail = ".";
    this.regServis.searchUser(this.searchName, this.searchSurname, this.searchUsername, this.searchEmail);
    this.initSearch();
  }



  logOut() {
    this.regServis.logOut(this.user.id);
  }

}
