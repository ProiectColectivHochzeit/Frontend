import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {InvitationService} from '../services/invitation.service';

@Component({
    selector: 'app-invitation-decline',
    templateUrl: './invitation-decline.component.html'
})
export class InvitationDeclineComponent implements OnInit {
  private readonly _currentRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _invitationService: InvitationService = inject(InvitationService);

  public message: string = "You have declined the invitation.";


    ngOnInit(): void {
        const invitationId = this._currentRoute.snapshot.queryParamMap.get('invitationId');

        if (invitationId){
          this._invitationService.saveInvitationId(invitationId);
        }

        this._invitationService.validateInvitation(invitationId!).subscribe({
          next: () => {
            this._invitationService.declineInvitation(invitationId!).subscribe({
              next: () => {
                this.message = "You have successfully declined the invitation.";
              }
            , error: () => {
                this.message = "An error occurred while declining the invitation. Please try again later.";
              }
            });
          },
          error: () => {
            this.message = "The invitation is invalid or has already been responded to.";
          }
        });
    }
}
