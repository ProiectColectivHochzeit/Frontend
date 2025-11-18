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
  ];

  get totalGuests() {
    return this.guests.length + this.guests.filter(g => g.plusOne && g.status === 'Confirmed').length;
  }

  get confirmedCount() {
    return this.guests.filter(g => g.status === 'Confirmed').length + this.guests.filter(g => g.plusOne && g.status === 'Confirmed').length;
  }

  get pendingCount() {
    return this.guests.filter(g => g.status === 'Pending').length + this.guests.filter(g => g.plusOne && g.status === 'Pending').length;
  }
}