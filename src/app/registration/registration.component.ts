import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RegistrationService } from '../registration.service';
import { User } from "../../../Models/User"
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  siteKey: string;
  aFormGroup: FormGroup;
  angForm: FormGroup;
  validiran: boolean;

  name: string;
  surname: string;
  date: Date;
  town: string;
  username: string;
  email: string;
  password: string;
  password2: string;
  photo: File;
  photoURL: string;

  messageRow1: string;
  messageRow2: string;
  messageRow3: string;
  messageRow4: string;
  messageRow5: string;
  messageRow6: string;

  private servisSub: Subscription;

  constructor(private formBuilder: FormBuilder, private servis: RegistrationService) {
    this.siteKey = "6LdL2b0ZAAAAAPdPtcHrKaE3QrGrm0cwkGFJEYJI";
    this.createForm();
    this.photo = null;
  }
  createForm() {
    this.angForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }
  initMessageError() {
    this.messageRow1 = null;
    this.messageRow2 = null;
    this.messageRow3 = null;
    this.messageRow4 = null;
    //this.messageRow5 = null;
    this.messageRow6 = null;
  }
  isMessageErrorEmpty(): boolean {
    if (this.messageRow1 != null) return false;
    if (this.messageRow2 != null) return false;
    if (this.messageRow3 != null) return false;
    if (this.messageRow4 != null) return false;
    // if (this.messageRow5 != null) return false;
    return true;
  }
  ngOnInit(): void {
    this.aFormGroup = this.formBuilder.group({
      recaptcha: ['', Validators.required]
    });
    this.servisSub = this.servis.getSubjectToListen().subscribe(
      status => {
        //PRoveri da li radi
        if (status == "addUser") this.messageRow5 = "Neuspesno prijavljivanje. Vec postoji nalog sa tim emailom ili usernamom";
      }
    );
    this.initMessageError();
    this.privremeniPodaciZaRegistraciju();
  }
  checkPhoto(event: Event) {
    //console.log("checkPhoto");
    this.photo = (event.target as HTMLInputElement).files[0];

    //console.log(this.photo);
    const reader = new FileReader();
    reader.onload = () => {
      this.photoURL = reader.result as string;
      //console.log(this.photoURL);
    }
    reader.readAsDataURL(this.photo);
  }
  privremeniPodaciZaRegistraciju() {
    this.name = "Veljko";
    this.surname = "Djorovic";
    this.date = new Date("1998-06-10");
    this.username = "veljo";
    this.email = "djorovicveljko@gmail.com";
    this.town = "Kraljevo, Srbija";
    this.password = "Veljo963159!";
    this.password2 = "Veljo963159!";
    this.validiran = true;
  }
  addUser() {
    this.initMessageError();
    { //Da li je sve uneto
      if (this.name == "" || this.name == null) this.messageRow1 = "Unesite sve podatke";
      if (this.surname == "" || this.surname == null) this.messageRow1 = "Unesite sve podatke";
      if (this.date == null) this.messageRow2 = "Unesite sve podatke";
      if (this.town == "" || this.town == null) this.messageRow2 = "Unesite sve podatke";
      if (this.username == "" || this.username == null) this.messageRow3 = "Unesite sve podatke";
      if (this.email == "" || this.email == null) this.messageRow3 = "Unesite sve podatke";
      if (this.password == "" || this.password == null) this.messageRow4 = "Unesite sve podatke";
      if (this.password2 == "" || this.password2 == null) this.messageRow4 = "Unesite sve podatke";
      if (!this.isMessageErrorEmpty()) {
        console.log("Da li je sve uneto");
        return;
      }
    }
    { //Da li je datum validan
      this.date = new Date(this.date);
      var now = new Date();
      if (this.date.getTime() > now.getTime()) this.messageRow2 = "Nevalidan datum";
      if (!this.isMessageErrorEmpty()) {
        console.log("Da li je datum validan");
        return;
      }
    }
    { //Da li je format lozinke i emaila dobar
      let lozinkaRegex = /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,})$/;
      let mailRegex = /^\w+@\w+\.\w+$/;
      if (!lozinkaRegex.test(this.password)) {
        this.messageRow4 = "Lozinka je u losem formatu";
      }
      if (!mailRegex.test(this.email)) {
        this.messageRow3 = "Korisnicko ime je u losem formatu";
      }
      if (!this.isMessageErrorEmpty()) {
        console.log("Da li je format lozinke i emaila dobar");
        return;
      }
    }
    { //Da li su lozinke identicne
      if (this.password !== this.password2) {
        this.messageRow4 = "Ispravno ponoviti lozinku";
        console.log("Da li su lozinke identicne");
        return;
      }
    }
    { //Da li je captcher validiran
      if (!this.validiran) {
        console.log("reCaptcher je istekao");
        this.messageRow4 = "Vasa sesija je istekla. \n Potvrdite da niste robot";
        return
      }
    }
    { //Da li je dodata slika
      if (this.photo == null) {
        console.log("Da li je dodata slika");
        this.messageRow5 = "Unesite i sliku";
        return
      }
    }

    let user: User = {
      id: "", name: this.name, surname: this.surname,
      username: this.username, date: this.date,
      email: this.email, photo: this.photo,
      password: this.password, town: this.town,
      type: "", photoPath: "",notification:""
    };
    this.servis.addUser(user);
    console.log("addUser: OK");
    this.initMessageError(); //SVe OK
  }
  handleReset() {
    this.validiran = false;
  }
  handleExpire() {
    this.validiran = false;
  }
  handleLoad() { }
  handleSuccess($event) {
    this.validiran = true;
  }
  ngOnDestroy(){
    this.servisSub.unsubscribe();
  }
}
