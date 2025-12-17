import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './auth.service';

export type createInvitationPayload = {
  eventId: string;
  currentUserId: string;
  guestEmail: string;
}

export type acceptInvitationPayload = {
  invitationId: string;
  invitedUserId: string;
}

@Injectable({
    providedIn: 'root'
})
export class InvitationService {
  private readonly _apiUrl = 'http://localhost:8080/api/invitations';
  private _invitationId: string | null = null;
  private readonly authService = inject(AuthService);

  private readonly _http: HttpClient = inject(HttpClient);


  public saveInvitationId(id: string): void {
    this._invitationId = id;
  }

  public getInvitationId(): string | null {
    return this._invitationId;
  }

  public validateInvitation(id: string): Observable<any> {
    return this._http.get(`${this._apiUrl}/validate/${id}`, {responseType: "text"});
  }

  public acceptInvitation(currentUserId : string, invitationId : string): Observable<any> {
    let acceptInvitationPayload : acceptInvitationPayload = {
      invitationId: invitationId,
      invitedUserId: currentUserId
    }
    return this._http.post(`${this._apiUrl}/accept`, acceptInvitationPayload);
  }

  public declineInvitation( invitationId : string): Observable<any> {
    return this._http.post(`${this._apiUrl}/decline/${invitationId}`, {});
  }

  public createInvitation(eventId: string, currentUserId: string, guestEmail: string): Observable<any> {
    if (guestEmail === this.authService.getEmail()) {
      throw new Error("You cannot invite yourself.");
    }
    const body: createInvitationPayload = {
        eventId,
        currentUserId,
        guestEmail
    }
    return this._http.post(`${this._apiUrl}`, body );
  }

}
