import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component'; 
import { PhotoGalleryComponent } from './photo-gallery/photo-gallery.component'; 

export const routes: Routes = [
  { path: '', component: DashboardComponent }, 
  { path: 'photo-gallery', component: PhotoGalleryComponent }, 
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: LoginComponent } 
];