// src/app/create-event/create-event.component.ts
import { Component } from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { AuthService } from '../services/auth.service';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  imports: [
    MatIcon,
    FormsModule
  ],
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent {
  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  private formatToDateOnly(value: string | Date | null | undefined): string | null {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const userEmail = this.authService.getEmail();
    if (!userEmail) {
      console.error('No logged user email. Cannot create event.');
      this.router.navigate(['/login']);
      return;
    }

    const payload = {
      name: form.value.name,
      startingDate: this.formatToDateOnly(form.value.startingDate),
      endDate: this.formatToDateOnly(form.value.endDate),
      location: form.value.location,
      organizerID: userEmail
    };

    console.log('Creating event payload (date-only):', payload);

    this.eventService.createEvent(payload).subscribe({
      next: () => this.router.navigate(['/my-events']),
      error: (err) => {
        console.error('Event creation error:', err);
        console.error('Server response:', err?.error);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/my-events']);
  }
}
