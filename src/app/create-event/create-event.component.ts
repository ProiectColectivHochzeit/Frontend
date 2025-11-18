import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import {EventService} from '../services/event.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss'
})
export class CreateEventComponent {

  constructor(private router: Router, private apiService: EventService) { }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.apiService.createEvent(form.value).subscribe({
      next: () => {
        this.router.navigate(['/my-events']);
      },
      error: (err) => {
        console.error('Event creation error:', err);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/my-events']);
  }
}
