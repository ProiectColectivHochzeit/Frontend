import {Component, inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {InvitationService} from '../services/invitation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  private _invitationService: InvitationService = inject(InvitationService);


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {

  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }).subscribe({
        next: () => {
          if (localStorage.getItem('invitationId')){
            const invitationId = localStorage.getItem('invitationId')!;
            this._invitationService.acceptInvitation(this.authService.getCurrentUserId()!, invitationId).subscribe({
              next: () => {
                this.router.navigate(['/events']);
              },
              error: (err) => {
                this.router.navigate(['/dashboard']);
              }
            });

            localStorage.removeItem('invitationId');
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login error:', err);
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onForgotPassword() {
    //to be implemented
  }
}
