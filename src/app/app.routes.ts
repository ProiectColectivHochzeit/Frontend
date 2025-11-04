import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: LoginComponent }, // Placeholder for signup
  { path: 'forgot-password', component: LoginComponent } // Placeholder for forgot password
];
