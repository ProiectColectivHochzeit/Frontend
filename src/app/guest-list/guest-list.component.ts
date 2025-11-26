import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

interface Guest {
  initials: string;
  name: string;
  email: string;
  status: 'Confirmed' | 'Pending' | 'Declined';
  plusOne: boolean;
}

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './guest-list.component.html',
  styleUrl: './guest-list.component.scss'
})
export class GuestListComponent {
  guests: Guest[] = [
    { initials: 'EW', name: 'Emma Wilson', email: 'emma.w@email.com', status: 'Confirmed', plusOne: true },
    { initials: 'JS', name: 'John Smith', email: 'john.s@email.com', status: 'Confirmed', plusOne: false },
    { initials: 'LB', name: 'Lisa Brown', email: 'lisa.b@email.com', status: 'Confirmed', plusOne: true },
    { initials: 'DM', name: 'David Miller', email: 'david.m@email.com', status: 'Pending', plusOne: false },
    { initials: 'AT', name: 'Anna Taylor', email: 'anna.t@email.com', status: 'Confirmed', plusOne: true },
    { initials: 'TD', name: 'Tom Davis', email: 'tom.d@email.com', status: 'Confirmed', plusOne: false },
    { initials: 'SC', name: 'Sophie Clark', email: 'sophie.c@email.com', status: 'Declined', plusOne: false },
    { initials: 'MJ', name: 'Michael Johnson', email: 'michael.j@email.com', status: 'Pending', plusOne: true },
  ];

  get totalGuests(): number {
    return this.guests.length + this.guests.filter(g => g.plusOne && g.status === 'Confirmed').length;
  }

  get confirmedCount(): number {
    return this.guests.filter(g => g.status === 'Confirmed').length + 
           this.guests.filter(g => g.plusOne && g.status === 'Confirmed').length;
  }

  get pendingCount(): number {
    return this.guests.filter(g => g.status === 'Pending').length + 
           this.guests.filter(g => g.plusOne && g.status === 'Pending').length;
  }

  get declinedCount(): number {
    return this.guests.filter(g => g.status === 'Declined').length;
  }

  getAvatarColor(initials: string): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    
    const charCode = initials.charCodeAt(0) + initials.charCodeAt(1);
    return colors[charCode % colors.length];
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'check_circle';
      case 'Pending':
        return 'schedule';
      case 'Declined':
        return 'cancel';
      default:
        return 'help';
    }
  }
}