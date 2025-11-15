import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { LoginComponent } from './login/login.component'; 

@Component({
 selector: 'app-root',
 standalone: true,
 imports: [RouterOutlet, LoginComponent],
 template: `
  <router-outlet></router-outlet>
 `, 
 styles: []
})
export class AppComponent {
 title = 'Wedding Events';
 
 constructor() {
      console.log('✅ AppComponent constructor called');
 }
}