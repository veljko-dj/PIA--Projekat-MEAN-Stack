import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { GuestComponent } from './guest/guest.component';
import { ForgotPassComponent } from './forgot-pass/forgot-pass.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { AdminComponent } from './admin/admin.component';
import { NewPassLoggedComponent } from './new-pass-logged/new-pass-logged.component';
import { UserComponent } from './user/user.component';
import { NewBookComponent } from './new-book/new-book.component';
import { NewGenreComponent } from './new-genre/new-genre.component';
import { BookComponent } from './book/book.component';
import { SearchBookComponent } from './search-book/search-book.component';
import { SearchUserComponent } from './search-user/search-user.component';
import { EventComponent } from './event/event.component';
import { NewEventComponent } from './new-event/new-event.component';
import { AllEventsComponent } from './all-events/all-events.component';


const routes: Routes = [
  { path: "", component: LoginComponent},
  { path: "login", component: LoginComponent},
  { path: "login/:jumpFrom", component: LoginComponent},
  { path: "registration", component: RegistrationComponent},
  { path: "guest", component: GuestComponent},
  { path: "resetPassword", component: ForgotPassComponent},
  { path: "resetPassword/:param/:token", component: NewPasswordComponent},
  { path: "newPassword", component: NewPassLoggedComponent},
  { path: "admin", component: AdminComponent},
  { path: "user", component: UserComponent},
  { path: "user/:id", component: UserComponent},
  { path: "newBook", component: NewBookComponent},
  { path: "newGenre", component: NewGenreComponent},
  { path: "book/:id", component: BookComponent},
  { path: "searchBook", component: SearchBookComponent},
  { path: "searchUser", component: SearchUserComponent},
  { path: "newEvent", component: NewEventComponent},
  { path: "event/:id", component: EventComponent},
  { path: "allEvents", component: AllEventsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
