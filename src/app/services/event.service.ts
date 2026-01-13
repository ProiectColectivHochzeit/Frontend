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

    return this.http.get<EventResponseDTO[]>(
      `${this.baseUrl}/user/${userId}`,
      { headers }
    ).pipe(
      catchError((error) => {
        console.error('Error loading events from backend:', error);
        // Return empty array instead of mock data
        return of([]);
      })
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
    // Validate that eventId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
      console.error('Invalid event ID format (not a UUID):', eventId);
      return new Observable(observer => {
        observer.error(new Error('Invalid event ID. Please select a valid event.'));
      });
    }

    const headers = this.buildAuthHeaders();
    return this.http.get<EventResponseDTO>(`${this.baseUrl}/${eventId}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error loading event from backend:', error);
        // Don't return mock data - let the error propagate
        throw error;
      })
    );
  }

  getParticipants(eventId: string): Observable<Participant[]> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
      console.error('Invalid event ID format for participants:', eventId);
      return of([]);
    }

    const headers = this.buildAuthHeaders();
    return this.http.get<Participant[]>(`${this.baseUrl}/${eventId}/participants`, { headers }).pipe(
      catchError((error) => {
        console.error('Error loading participants:', error);
        return of([]);
      })
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
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
      console.error('Invalid event ID format for photos:', eventId);
      return of([]);
    }

    const headers = this.buildAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/${eventId}/photos`, { headers }).pipe(
      map((photos) => {
        console.log('Photos loaded from backend:', photos);
        return photos.map((p) => ({
          id: p.id || p.publicId || Date.now().toString(),
          url: p.url,
          uploaderName: p.uploaderName || 'Unknown',
          uploadedAt: this.formatUploadDate(p.uploadedAt)
        }));
      }),
      catchError((error) => {
        console.error('Error loading photos from backend:', error);
        // Return empty array instead of mock data to see real errors
        return of([]);
      })
    );
  }

  uploadPhoto(eventId: string, file: File): Observable<Photo> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
      console.error('Invalid event ID format for photo upload:', eventId);
      return new Observable(observer => {
        observer.error(new Error('Invalid event ID. Cannot upload photo to a non-existent event.'));
      });
    }

    const token = this.authService.getToken();

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);

    console.log('Uploading photo for event:', eventId);

    return this.http.post<any>(this.photosUrl, formData, { headers }).pipe(
      map((res) => {
        console.log('Photo upload response:', res);
        const photo: Photo = {
          id: res.id || res.publicId || Date.now().toString(),
          url: res.url as string,
          uploaderName: res.uploaderName || this.authService.getFullName() || 'You',
          uploadedAt: this.formatUploadDate(res.uploadedAt) || 'Just now'
        };
        return photo;
      }),
      catchError((error) => {
        console.error('Error uploading photo:', error);
        // Don't return fallback - let the error propagate so user knows it failed
        throw error;
      })
    );
  }

  private formatUploadDate(dateStr: string): string {
    if (!dateStr) return 'Just now';
    
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

}
