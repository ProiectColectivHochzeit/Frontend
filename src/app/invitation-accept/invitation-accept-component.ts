import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {InvitationService} from '../services/invitation.service';
import {AuthService} from '../services/auth.service';

@Component({
    selector: 'app-invitation-accept',
    templateUrl: './invitation-accept.component.html',
})
export class InvitationAcceptComponent implements OnInit {

  private readonly _currentRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _invitationService = inject(InvitationService);
  private readonly _authService = inject(AuthService);

  ngOnInit(): void {
    const invitationId = this._currentRoute.snapshot.queryParamMap.get('invitationId');

    if (!invitationId){
      return
    }

    this._invitationService.saveInvitationId(invitationId);
    localStorage.setItem('invitationId', invitationId);

    this._invitationService.validateInvitation(invitationId).subscribe({
      next: () =>{
        if (this._authService.isLoggedIn()){
          this._invitationService.acceptInvitation(this._authService.getCurrentUserId()!, invitationId).subscribe({
            next: () => {
              localStorage.removeItem('invitationId');
              this._router.navigate(['/events']);
            },
          });
        }
        else {
          this._router.navigate(['/register']).then(r => {});

      }
    },
      error: (err) => {
        this._router.navigate(['/error']).then(r => {});
      }
    });
  }
}
