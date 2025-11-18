import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component'; 
import { PhotoGalleryComponent } from './photo-gallery/photo-gallery.component';
import { GuestListComponent } from './guest-list/guest-list.component';     

export const routes: Routes = [
  { path: '', component: DashboardComponent }, 
  { path: 'photo-gallery', component: PhotoGalleryComponent }, 
  { path: 'guest-list', component: GuestListComponent },       
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: LoginComponent } 
];