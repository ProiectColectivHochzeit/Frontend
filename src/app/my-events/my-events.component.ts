import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { EventService, EventResponseDTO } from '../services/event.service';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.scss'
})
export class MyEventsComponent implements OnInit {
  events: EventResponseDTO[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadMyEvents();
  }

  private loadMyEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getEventsForCurrentUser().subscribe({
      next: (events) => {
        const uniqueEventsMap = new Map<string, EventResponseDTO>();
        for (const ev of events) {
          uniqueEventsMap.set(ev.id, ev);
        }
        this.events = Array.from(uniqueEventsMap.values());

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);

        if (err.status === 404 && err.error?.detail === 'Eventorganizer not found.') {
          this.events = [];
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Could not load your events. Please try again.';
        }

        this.isLoading = false;
      }
    });
  }


  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
