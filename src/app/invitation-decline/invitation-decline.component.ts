import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-invitation-decline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="invitation-container">
      <div class="invitation-card">
        <h2>Processing your response...</h2>
        <p *ngIf="loading">Please wait while we process your decline.</p>
        <p *ngIf="error" class="error">{{ error }}</p>
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
export class InvitationDeclineComponent implements OnInit {
  loading = true;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const invitationId = this.route.snapshot.queryParams['invitationId'];
    
    if (!invitationId) {
      this.error = 'Invalid invitation link. No invitation ID provided.';
      this.loading = false;
      return;
    }

    // Check if user is logged in
    if (!this.authService.getToken()) {
      this.error = 'Please log in to decline the invitation.';
      this.loading = false;
      setTimeout(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: `/invitation-decline?invitationId=${invitationId}` } });
      }, 2000);
      return;
    }

    this.eventService.declineInvitation(invitationId).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Invitation declined.';
        setTimeout(() => {
          this.router.navigate(['/my-events']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || err.message || 'Failed to decline invitation. Please try again.';
        console.error('Error declining invitation:', err);
      }
    });
  }
}
