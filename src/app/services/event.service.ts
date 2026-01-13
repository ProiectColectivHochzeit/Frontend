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
  invitationId?: string;
}

export interface Photo {
  id: string;
  url: string;
  publicId?: string;
  uploaderName: string;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly baseUrl = 'http://localhost:8080/api/events';
  private readonly photosUrl = 'http://localhost:8080/api/photos';

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
      return new Observable(observer => {
        observer.error(new Error('Invalid event ID. Please select a valid event.'));
      });
    }

    const headers = this.buildAuthHeaders();
    return this.http.get<EventResponseDTO>(`${this.baseUrl}/${eventId}`, { headers }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getParticipants(eventId: string): Observable<Participant[]> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
      return of([]);
    }

    const headers = this.buildAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/${eventId}/participants`, { headers }).pipe(
      map((response) => {
        const mapped = response.map((item: any) => {
          // Map backend status enum to frontend status
          let status: 'Confirmed' | 'Pending' | 'Declined';
          if (item.status === 'ACCEPTED') {
            status = 'Confirmed';
          } else if (item.status === 'PENDING') {
            status = 'Pending';
          } else if (item.status === 'DECLINED') {
            status = 'Declined';
          } else {
            status = 'Pending'; // default
          }

          return {
            id: item.id || item.email, // Use email as fallback ID if id is null
            name: item.name || item.email.split('@')[0], // Use email prefix if name is not available
            email: item.email,
            status: status,
            invitationId: item.invitationId || item.id
          } as Participant;
        });
        return mapped;
      }),
      catchError((error) => {
        return of([]);
      })
    );
  }

  inviteParticipant(eventId: string, email: string): Observable<any> {
    const headers = this.buildAuthHeaders();
    return this.http.post(`${this.baseUrl}/${eventId}/invite`, { email }, { headers }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  getPhotos(eventId: string): Observable<Photo[]> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
      return of([]);
    }

    const headers = this.buildAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/${eventId}/photos`, { headers }).pipe(
      map((photos) => {
        return photos.map((p) => ({
          id: p.id || p.publicId || Date.now().toString(),
          url: p.url,
          publicId: p.publicId,
          uploaderName: p.uploaderName || 'Unknown',
          uploadedAt: this.formatUploadDate(p.uploadedAt)
        } as Photo));
      }),
      catchError((error) => {
        return of([]);
      })
    );
  }

  uploadPhoto(eventId: string, file: File): Observable<Photo> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
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

    return this.http.post<any>(this.photosUrl, formData, { headers }).pipe(
      map((res) => {
        const photo: Photo = {
          id: res.id || res.publicId || Date.now().toString(),
          url: res.url as string,
          publicId: res.publicId,
          uploaderName: res.uploaderName || this.authService.getFullName() || 'You',
          uploadedAt: this.formatUploadDate(res.uploadedAt) || 'Just now'
        };
        return photo;
      }),
      catchError((error) => {
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

  acceptInvitation(invitationId: string): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      return new Observable(observer => {
        observer.error(new Error('User not logged in'));
      });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(invitationId)) {
      return new Observable(observer => {
        observer.error(new Error('Invalid invitation ID format'));
      });
    }

    const headers = this.buildAuthHeaders();
    const payload = {
      invitationId: invitationId,
      invitedUserId: userId
    };

    return this.http.post('http://localhost:8080/api/invitations/accept', payload, { headers }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  declineInvitation(invitationId: string): Observable<any> {
    const headers = this.buildAuthHeaders();
    return this.http.post(`http://localhost:8080/api/invitations/decline/${invitationId}`, {}, { headers }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  deletePhoto(publicId: string): Observable<any> {
    const headers = this.buildAuthHeaders();
    return this.http.delete(`http://localhost:8080/api/photos/${publicId}`, { headers }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  deleteInvitation(eventId: string, invitationId: string): Observable<any> {
    const headers = this.buildAuthHeaders();
    return this.http.delete(`${this.baseUrl}/${eventId}/invitations/${invitationId}`, { headers }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  importParticipantsFromExcel(eventId: string, file: File): Observable<any> {
    const token = this.authService.getToken();
    
    // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.baseUrl}/${eventId}/import-participants`, formData, { headers }).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

}
