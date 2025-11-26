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
  organizerID: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly baseUrl = 'http://localhost:8080/api/events';

  constructor(
      private http: HttpClient,
      private authService: AuthService
  ) {}

  private buildAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('User not logged in or token missing.');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getEventsForCurrentUser(): Observable<EventResponseDTO[]> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not logged in or userId missing in token.');
    }
    const headers = this.buildAuthHeaders();
    return this.http.get<EventResponseDTO[]>(
      `${this.baseUrl}/user/${userId}`,
      { headers }
    );
  }

  createEvent(eventData: any): Observable<EventResponseDTO> {
    // backend does not require userId in POST body if token contains identity,
    // but keep validation that user is logged in
    this.authService.getCurrentUserId(); // will be null if not logged in
    const headers = this.buildAuthHeaders();


    return this.http.post<EventResponseDTO>(this.baseUrl, eventData, { headers });
  }
}
