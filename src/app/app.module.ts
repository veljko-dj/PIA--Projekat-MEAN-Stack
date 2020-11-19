import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { GuestComponent } from './guest/guest.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ForgotPassComponent } from './forgot-pass/forgot-pass.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { AdminComponent } from './admin/admin.component';
import { NewPassLoggedComponent } from './new-pass-logged/new-pass-logged.component';
import { UserComponent } from './user/user.component';
import { BookComponent } from './book/book.component';
import { NewBookComponent } from './new-book/new-book.component';
import { NewGenreComponent } from './new-genre/new-genre.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from "@angular/material/paginator";
import { SearchBookComponent } from './search-book/search-book.component';
import { SearchUserComponent } from './search-user/search-user.component';
import { ChartsModule } from "ng2-charts";
import { NewEventComponent } from './new-event/new-event.component';
import { EventComponent } from './event/event.component';
import {MatStepperModule} from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import { AllEventsComponent } from './all-events/all-events.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    GuestComponent,
    ForgotPassComponent,
    NewPasswordComponent,
    AdminComponent,
    NewPassLoggedComponent,
    UserComponent,
    BookComponent,
    NewBookComponent,
    NewGenreComponent,
    SearchBookComponent,
    SearchUserComponent,
    NewEventComponent,
    EventComponent,
    AllEventsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatPaginatorModule,
    ChartsModule,
    MatStepperModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
