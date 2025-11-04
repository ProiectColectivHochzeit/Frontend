import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <-- New import
import { LoginComponent } from './login/login.component'; // Keep, but no longer in template

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent], // <-- Changed to use RouterOutlet
  template: `
    <router-outlet></router-outlet>
  `, // <-- Changed to use router outlet
  styles: []
})
export class AppComponent {
  title = 'Wedding Events';
  
  constructor() {
    console.log('✅ AppComponent constructor called');
  }
}