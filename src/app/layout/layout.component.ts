import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  displayName = 'Guest';
  initials = 'G';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const name = this.authService.getFullName();
    if (name) {
      this.displayName = name;
      this.initials = this.getInitials(name);
    } else {
      const email = this.authService.getEmail();
      if (email) {
        this.displayName = email;
        this.initials = this.getInitials(email);
      }
    }
  }

  private getInitials(text: string): string {
    const parts = text.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'U';
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
