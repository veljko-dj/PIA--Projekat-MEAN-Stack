import { Injectable } from '@angular/core';
import { User } from 'Models/User';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  token: string;
  userId: string;

  private subj = new Subject<string>();

  constructor(private http: HttpClient, private router: Router) { }

  getSubjectToListen() {
    return this.subj.asObservable();
  }
  addUser(user: User) {
    const userData = new FormData();
    userData.append("name", user.name);
    userData.append("surname", user.surname);
    userData.append("date", user.date.toLocaleString());
    userData.append("town", user.town);
    userData.append("username", user.username);
    userData.append("email", user.email);
    userData.append("password", user.password);
    userData.append("image", user.photo, user.username);
    userData.append("notification", user.notification);
    this.http.post("http://localhost:3000/user/add", userData)
      .subscribe(response => {
        this.router.navigate(["/"]);
        console.log("Uspesno");
      }, error => {
        console.log("Neuspesno");
        if (error.status == 500) this.subj.next("addUser");
      })

  }
  login(username1: string, password1: string) {
    this.http
      .post<{
        token: string,
        id: string,
        name: string,
        surname: string,
        date: string,
        town: string,
        username: string,
        email: string,
        password: string,
        imagePath: string,
        type: string,
        notification: string
      }>(
        "http://localhost:3000/user/login", { username: username1, password: password1 }
      )
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (this.token) {
          let tmpUser: User = {
            date: new Date(response.date),
            email: response.email,
            id: response.id,
            name: response.name,
            password: "",
            photo: null,
            surname: response.surname,
            town: response.town,
            username: response.username,
            type: response.type,
            photoPath: response.imagePath,
            notification: response.notification
          }
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(tmpUser));
          if (tmpUser.type == "admin") this.router.navigate(["/user"]);
          else if (tmpUser.type == "user" || tmpUser.type == "moderator") this.router.navigate(["/user"]);
          else this.router.navigate(["/registration"]);
        }
      }, error => {
        if (error.status == 502) this.subj.next("login/pogresnaSifra");
        else if (error.status == 501) this.subj.next("login/nePostoji");
        else if (error.status == 504) this.subj.next("login/cekaj");
        else if (error.status == 505) this.subj.next("login/odbijen");
        else this.subj.next("login");
      });
  }

  validateUser(idUser: string, type: string, token:string) {
    //console.log("validateUsr95");
    this.http
      .post<{
        message: string,
        newRate: string
      }>(
        "http://localhost:3000/user/validateUser", {
        idUser: idUser,
        valid: type,
        token: token
      })
      .subscribe(response => {
        this.subj.next("user/validateUser/uspesno");
      }, error => {
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        else
        console.log("user/validate/neuspesno");
      });
  }
  checkUserAndSend(email1: string) {
    this.http
      .post<{
        name: string,
        surname: string,
        username: string
      }>(
        "http://localhost:3000/user/checkAndMail", { email: email1 }
      )
      .subscribe(response => {
        console.log(response);
        this.subj.next("Bravo " + response.name + ", uspesno poslat mejl");
      }, error => {
        if (error.status == 510) this.subj.next("check/nePostoji");
        else this.subj.next("check");
      });
  }
  resetPassword(password1: string, tokenMail1: string) {
    this.http
      .post<{
        name: string,
        surname: string,
        username: string
      }>(
        "http://localhost:3000/user/resetPasswordMail", { password: password1, tokenMail: tokenMail1 }
      )
      .subscribe(response => {
        console.log(response);
        this.subj.next("Uspesno ste resetovalli lozinku");
      }, error => {
        if (error.status == 514) this.subj.next("reset/istekaoToken");
        else /*if (error.status == 511) this.subj.next("reset/nePostoji");
        else*/ this.subj.next("reset");
      });
  }
  changePassword(password1: string, token1: string) {
    this.http
      .post<{
        name: string,
        surname: string,
        username: string
      }>(
        "http://localhost:3000/user/changePassword", { password: password1, token: token1 }
      )
      .subscribe(response => {
        this.subj.next("reset/Uspesno");
      }, error => {
        if (error.status == 520) this.subj.next("reset/istekaoToken");
        else /*if (error.status == 511) this.subj.next("reset/nePostoji");
      else*/ this.subj.next("change");
      });
  }
  checkIfLoggedIn(): User {
    let a = localStorage.getItem("user");
    if (a == null) {
      this.router.navigate([""]);
      console.log("Greska neka. Nije ubacen u LocalStorage ulogovan korisnik");
      return null;
    }
    if (localStorage.getItem('token') == null) console.log("Negde si zaboravio da dodas token");
    return JSON.parse(a);
  }
  checkIfGuest(user: User) {
    if (!user)
      this.router.navigate(["login"]);
    else if (user.type == "guest") {
      this.router.navigate(["guest"]);
    }
  }
  updateUser(user1: User, token1: string) {
    this.http
      .post<{
        name: string,
        surname: string,
        username: string
      }>(
        "http://localhost:3000/user/update", {
        name: user1.name,
        surname: user1.surname,
        date: user1.date,
        town: user1.town,
        token: token1
      }
      )
      .subscribe(response => {
        this.subj.next("update/uspesnoApdejtovan");
      }, error => {
        if (error.status == 520) this.subj.next("update/istekaoToken");
        else /*if (error.status == 511) this.subj.next("reset/nePostoji");
    else*/ this.subj.next("update");
      });
  }
  updateUserPhoto(photo1: File, user1: User, token1: string) {
    const userData = new FormData();
    userData.append("token", token1);
    userData.append("image", photo1, user1.username);
    this.http.post<{
      imagePath: string
    }>("http://localhost:3000/user/updatePhoto", userData)
      .subscribe(response => {
        user1.photo = photo1;
        user1.photoPath = response.imagePath;
        localStorage.setItem('user', JSON.stringify(user1));
        this.router.navigate(["/user"]);
        console.log("Uspesno");
      }, error => {
        console.log("Neuspesno");
        if (error.status == 500) this.subj.next("updatePhoto");
      })
  }
  logOut(idUser: string) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.http
      .post<{
        name: string,
        surname: string,
        username: string
      }>(
        "http://localhost:3000/user/logout", { idUser: idUser }
      )
      .subscribe(response => {
        this.subj.next("logout/odjavljen");
      }, error => {
        if (error.status > 500) this.subj.next("logout/neuspesnaOdjava");
      });
  }
  lastSeen(userId: string) {
    this.http
      .post<{
        lastSeen: string
      }>(
        "http://localhost:3000/user/checkLastSeen", { id: userId }
      )
      .subscribe(response => {
        this.subj.next("lastSeen/DELIMITER" + response.lastSeen);
      }, error => {
        if (error.status == 510) this.subj.next("lastSeen/greskaNeka");
        else this.subj.next("lastSeen");
      });
  }
  searchUser(searchName: string, searchSurname: string, searchUsername: string, searchEmail: string) {
    this.http
      .post<{
        userss: string;
      }>("http://localhost:3000/user/searchUser", {
        name: searchName, surname: searchSurname,
        username: searchUsername, email: searchEmail
      })
      .subscribe(response => {
        //console.log(response.userss);
        this.subj.next("user/searchUser/uspesno/DELIMITER" + response.userss);
      }, error => {
        this.subj.next("user/searchUser/neuspesno");
      });
  }
  searchUserById(id: string) {
    this.http
      .post<{
        userr: string;
      }>("http://localhost:3000/user/searchUserById", { id: id })
      .subscribe(response => {
        console.log("evo me");
        console.log(response.userr);
        this.subj.next("searchUserById/uspesno/DELIMITER" + response.userr);
      }, error => {
        this.subj.next("searchUserById/neuspesno");
      });
  }
  getCommentsByUserId(id: string, postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .post<{
        status: number,
        comments: string, //ovaj string je JSON,
        maxComm: number
      }>("http://localhost:3000/bookComm/getByUserId" + queryParams, { idUser: id })
      .subscribe(response => {
        //console.log("AAAA");
        //console.log(response.maxComm);
        if (response.status == 403) this.subj.next("getCommsByUser/neuspesno");
        else this.subj.next("getCommsByUser/uspesno/DELIMITER" + response.comments + "DELIMITER" + response.maxComm);
      }, error => {
        this.subj.next("getCommsByUser/neuspesno");
      });
  }
  getBooksByUserId(id: string, type: string, postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .post<{
        status: number,
        books: string, //ovaj string je JSON,
        maxBooks: number
      }>("http://localhost:3000/readBook/getByUserIdAndType" + queryParams, { idUser: id, type: type })
      .subscribe(response => {
        if (response.status == 403) this.subj.next("getBooksByUser/neuspesno");
        else {
          if (postsPerPage != 0)
            this.subj.next("getBooksByUser/uspesno/DELIMITER" + type + "DELIMITER" + response.books + "DELIMITER" + response.maxBooks);
          else
            this.subj.next("getAllReadBooksByUser/uspesno/DELIMITER" + response.books);
        }
      }, error => {
        this.subj.next("getBooksByUser/neuspesno");
      });
  }
  deleteReadBook(idUser: string, idBook: string, token: string) {
    this.http
      .post<{
        status: number,
        books: string //ovaj string je JSON,
      }>("http://localhost:3000/readBook/deleteReadBook", {
        idUser: idUser,
        idBook: idBook,
        token: token
      })
      .subscribe(response => {
        if (response.status == 403) this.subj.next("deleteReadBook/neuspesno");
        //else this.subj.next("deleteReadBook/uspesno" );
      }, error => {
        if (error.status == 520) this.router.navigate(['login/sessionExpired']);
        else
          this.subj.next("deleteReadBook/neuspesno");
      });
  }
  followUser(idFrom: string, usernameFrom: string, idTo: string, usernameTo: string) {
    this.http
      .post("http://localhost:3000/user/followUser", { idUserFrom: idFrom, idUserTo: idTo, usernameFrom: usernameFrom, usernameTo: usernameTo })
      .subscribe(response => {
        //if (response.status == 403) this.subj.next("followUser/neuspesno");
        //else this.subj.next("deleteReadBook/uspesno" );
      }, error => {
        this.subj.next("followUser/neuspesno");
      });
  }
  unfollowUser(idFrom: string, idTo: string) {
    this.http
      .post("http://localhost:3000/user/unfollowUser", { idUserFrom: idFrom, idUserTo: idTo })
      .subscribe(response => {
        //if (response.status == 403) this.subj.next("followUser/neuspesno");
        //else this.subj.next("deleteReadBook/uspesno" );
      }, error => {
        this.subj.next("unfollowUser/neuspesno");
      });
  }
  doesFollow(idFrom: string, idTo: string) {
    this.http
      .post<{
        yesOrNo: boolean
      }>("http://localhost:3000/user/doesFollow", { idUserFrom: idFrom, idUserTo: idTo })
      .subscribe(response => {
        if (response.yesOrNo) this.subj.next("doesFollow/uspesno/yes");
        else this.subj.next("doesFollow/uspesno/no");
        //if (response.status == 403) this.subj.next("followUser/neuspesno");
        //else this.subj.next("deleteReadBook/uspesno" );
      }, error => {
        this.subj.next("unfollowUser/neuspesno");
      });
  }
  getFollowingForUserId(id: string) {
    this.http
      .post<{
        users: string;
      }>("http://localhost:3000/user/getFollowingForUserId", { idUserFrom: id })
      .subscribe(response => {
        this.subj.next("getFollowingForUserId/uspesno/DELIMITER" + response.users);
        //if (response.status == 403) this.subj.next("followUser/neuspesno");
        //else this.subj.next("deleteReadBook/uspesno" );
      }, error => {
        this.subj.next("getFollowingForUserId/neuspesno");
      });
  }
}
