import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface EventResponseDTO {
  id: string;
  name: string;
  startingDate: string;
  endDate: string;
  location: string;
  organizerID: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  status: 'Confirmed' | 'Pending' | 'Declined';
}

export interface Photo {
  id: string;
  url: string;
  uploaderName: string;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly baseUrl = 'http://localhost:8080/api/events';
  private readonly photosUrl = 'http://localhost:8080/api/photos';

  // Mock data for development
  private mockParticipants: Participant[] = [
    { id: '1', name: 'Emma Wilson', email: 'emma.w@email.com', status: 'Confirmed' },
    { id: '2', name: 'John Smith', email: 'john.s@email.com', status: 'Confirmed' },
    { id: '3', name: 'Lisa Brown', email: 'lisa.b@email.com', status: 'Pending' },
    { id: '4', name: 'David Miller', email: 'david.m@email.com', status: 'Declined' },
  ];

  private mockPhotos: Photo[] = [
    { id: '1', url: 'https://picsum.photos/400/300?random=1', uploaderName: 'Emma Wilson', uploadedAt: '2 hours ago' },
    { id: '2', url: 'https://picsum.photos/400/300?random=2', uploaderName: 'John Smith', uploadedAt: '3 hours ago' },
    { id: '3', url: 'https://picsum.photos/400/300?random=3', uploaderName: 'Lisa Brown', uploadedAt: '1 day ago' },
  ];

  // Mock events for development
  private mockEvents: EventResponseDTO[] = [
    {
      id: 'mock-event-1',
      name: 'Summer Wedding Celebration',
      startingDate: '2025-06-15',
      endDate: '2025-06-16',
      location: 'Grand Ballroom, City Center',
      organizerID: ''
    },
    {
      id: 'mock-event-2',
      name: 'Birthday Party',
      startingDate: '2025-07-20',
      endDate: '2025-07-20',
      location: 'Riverside Garden',
      organizerID: ''
    },
    {
      id: 'mock-event-3',
      name: 'Anniversary Dinner',
      startingDate: '2025-08-10',
      endDate: '2025-08-10',
      location: 'Skyline Restaurant',
      organizerID: ''
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

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

    // Update mock events with current user as organizer
    this.mockEvents.forEach(event => event.organizerID = userId);

    return this.http.get<EventResponseDTO[]>(
      `${this.baseUrl}/user/${userId}`,
      { headers }
    ).pipe(
      catchError(() => of(this.mockEvents))
    );
  }

  createEvent(eventData: any): Observable<EventResponseDTO> {
    // backend does not require userId in POST body if token contains identity,
    // but keep validation that user is logged in
    this.authService.getCurrentUserId(); // will be null if not logged in
    const headers = this.buildAuthHeaders();


    return this.http.post<EventResponseDTO>(this.baseUrl, eventData, { headers });
  }

  getEventById(eventId: string): Observable<EventResponseDTO> {
    const headers = this.buildAuthHeaders();
    return this.http.get<EventResponseDTO>(`${this.baseUrl}/${eventId}`, { headers }).pipe(
      catchError(() => {
        // Return mock event for development
        return of({
          id: eventId,
          name: 'Sample Wedding Event',
          startingDate: '2025-06-15',
          endDate: '2025-06-16',
          location: 'Grand Ballroom, City Center',
          organizerID: this.authService.getCurrentUserId() || ''
        });
      })
    );
  }

  getParticipants(eventId: string): Observable<Participant[]> {
    const headers = this.buildAuthHeaders();
    return this.http.get<Participant[]>(`${this.baseUrl}/${eventId}/participants`, { headers }).pipe(
      catchError(() => of(this.mockParticipants))
    );
  }

  inviteParticipant(eventId: string, email: string): Observable<any> {
    const headers = this.buildAuthHeaders();
    return this.http.post(`${this.baseUrl}/${eventId}/invite`, { email }, { headers }).pipe(
      catchError(() => {
        // Mock success for development
        const newParticipant: Participant = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email: email,
          status: 'Pending'
        };
        this.mockParticipants.push(newParticipant);
        return of({ success: true });
      })
    );
  }

  getPhotos(eventId: string): Observable<Photo[]> {
    const headers = this.buildAuthHeaders();
    return this.http.get<Photo[]>(`${this.baseUrl}/${eventId}/photos`, { headers }).pipe(
      catchError(() => of(this.mockPhotos))
    );
  }

  uploadPhoto(eventId: string, file: File): Observable<Photo> {
    const token = this.authService.getToken();

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);

    return this.http.post<any>(this.photosUrl, formData, { headers }).pipe(
      map((res) => {
        const photo: Photo = {
          id: (res.publicId as string) || Date.now().toString(),
          url: res.url as string,
          uploaderName: 'You',
          uploadedAt: 'Just now'
        };
        return photo;
      }),
      catchError(() => {
        const fallback: Photo = {
          id: Date.now().toString(),
          url: URL.createObjectURL(file),
          uploaderName: 'You',
          uploadedAt: 'Just now'
        };
        return of(fallback);
      })
    );
  }

}
