import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface EventResponseDTO {
  id: string;
  name: string;
  startingDate: string;
  endDate: string;
  location: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly baseUrl = 'http://localhost:8080/api/events';

  constructor(
      private http: HttpClient,
      private authService: AuthService
  ) {}

  getEventsForCurrentUser(): Observable<EventResponseDTO[]> {
    const userId = this.authService.getCurrentUserId();
    const token = this.authService.getToken();

    if (!userId) {
      throw new Error('User not logged in or userId missing in token.');
    }

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<EventResponseDTO[]>(`${this.baseUrl}/user/${userId}`, {
      headers
    });
  }
}
