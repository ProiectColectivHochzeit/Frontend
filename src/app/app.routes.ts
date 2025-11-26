import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import {MyEventsComponent} from './my-events/my-events.component';
import {CreateEventComponent} from './create-event/create-event.component';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import { GuestListComponent } from './guest-list/guest-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'home', component: DashboardComponent },
      { path: 'my-events', component: MyEventsComponent },
      { path: 'create-event', component: CreateEventComponent },
      { path: 'guest-list', component: GuestListComponent },
      { path: '**', redirectTo: 'home' }
    ]
  }
];
