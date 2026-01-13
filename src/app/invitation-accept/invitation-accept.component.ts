import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { EventService } from '../services/event.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-invitation-accept',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="invitation-container">
      <div class="invitation-card">
        <h2>Processing your invitation...</h2>
        <p *ngIf="loading">Please wait while we add you to the event.</p>
        <div *ngIf="error" class="error">
          <p>{{ error }}</p>
          <button *ngIf="showLogoutButton" mat-raised-button color="primary" (click)="logoutAndRetry()" style="margin-top: 20px;">
            Log Out and Try Again
          </button>
        </div>
        <p *ngIf="success" class="success">{{ success }}</p>
      </div>
    </div>
  `,
  styles: [`
    .invitation-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .invitation-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      text-align: center;
    }
    h2 {
      color: #333;
      margin-bottom: 20px;
    }
    .error {
      color: #d32f2f;
      margin-top: 20px;
    }
    .success {
      color: #2e7d32;
      margin-top: 20px;
    }
  `]
})
export class InvitationAcceptComponent implements OnInit {
  loading = true;
  error: string | null = null;
  success: string | null = null;
  showLogoutButton = false;
  invitationId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.invitationId = this.route.snapshot.queryParams['invitationId'];
    
    console.log('Invitation accept component loaded with invitationId:', this.invitationId);
    console.log('All query params:', this.route.snapshot.queryParams);
    
    if (!this.invitationId) {
      this.error = 'Invalid invitation link. No invitation ID provided.';
      this.loading = false;
      return;
    }
    
    console.log('Invitation ID from URL:', this.invitationId, 'Type:', typeof this.invitationId);

    // Check if user is logged in
    if (!this.authService.getToken()) {
      this.error = 'Please log in to accept the invitation.';
      this.loading = false;
      // Redirect immediately to login with returnUrl
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: `/invitation-accept?invitationId=${this.invitationId}`,
          message: 'Please log in with the email that received the invitation to accept it.'
        } 
      });
      return;
    }
    
    // Log current user info for debugging
    const currentUserEmail = this.authService.getEmail();
    const currentUserId = this.authService.getCurrentUserId();
    console.log('Current logged-in user:', { email: currentUserEmail, userId: currentUserId });

    // Automatically accept the invitation when component loads (user is logged in)
    this.acceptInvitation();
  }

  private acceptInvitation(): void {
    if (!this.invitationId) {
      this.error = 'Invalid invitation ID.';
      this.loading = false;
      return;
    }

    this.eventService.acceptInvitation(this.invitationId).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Invitation accepted! You have been added to the event. Redirecting to your events...';
        console.log('Invitation accepted successfully');
        // Navigate immediately - the my-events component will reload
        setTimeout(() => {
          this.router.navigate(['/my-events']).then(() => {
            // Force a page reload to ensure events are refreshed
            window.location.reload();
          });
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error || err.message || 'Failed to accept invitation. Please try again.';
        this.error = typeof errorMessage === 'string' ? errorMessage : errorMessage.toString();
        console.error('Error accepting invitation:', err);
        console.error('Full error object:', JSON.stringify(err, null, 2));
        
        // If email mismatch, show logout button
        if (this.error.includes('does not match the invitation email') || this.error.includes('email')) {
          this.showLogoutButton = true;
          this.error = 'You are logged in with a different email than the one that was invited. Please log out and log in with the email that received the invitation.';
        }
      }
    });
  }

  logoutAndRetry(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { 
      queryParams: { 
        returnUrl: `/invitation-accept?invitationId=${this.invitationId}`,
        message: 'Please log in with the email that received the invitation'
      } 
    });
  }
}
