import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventService, EventResponseDTO, Participant, Photo } from '../services/event.service';
import { AuthService } from '../services/auth.service';
import { InviteDialogComponent } from './invite-dialog/invite-dialog.component';
import { PhotoGalleryComponent } from './photo-gallery/photo-gallery.component';

@Component({
    selector: 'app-event-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatTabsModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule
    ],
    templateUrl: './event-details.component.html',
    styleUrl: './event-details.component.scss'
})
export class EventDetailsComponent implements OnInit {
    eventId: string = '';
    event: EventResponseDTO | null = null;
    participants: Participant[] = [];
    photos: Photo[] = [];
    isLoading = true;
    isOrganizer = false;
    currentUserId: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private eventService: EventService,
        private authService: AuthService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.currentUserId = this.authService.getCurrentUserId();
        this.route.params.subscribe(params => {
            this.eventId = params['id'];
            this.loadEventData();
        });
    }

    private loadEventData(): void {
        this.isLoading = true;

        // Validate UUID format before making API call
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(this.eventId)) {
            alert('Invalid event ID. Please navigate to a valid event.');
            this.isLoading = false;
            return;
        }

        this.eventService.getEventById(this.eventId).subscribe({
            next: (event: EventResponseDTO) => {
                this.event = event;
                this.isOrganizer = event.organizerID === this.currentUserId;
                this.loadParticipants();
                this.loadPhotos();
            },
            error: (err: Error) => {
                alert('Event not found. Please check if the event exists.');
                this.isLoading = false;
            }
        });
    }

    private loadParticipants(): void {
        this.eventService.getParticipants(this.eventId).subscribe({
            next: (participants: Participant[]) => {
                this.participants = participants;
                this.isLoading = false;
            },
            error: (err: Error) => {
                this.isLoading = false;
            }
        });
    }

    private loadPhotos(): void {
        this.eventService.getPhotos(this.eventId).subscribe({
            next: (photos: Photo[]) => {
                this.photos = photos;
            },
            error: (err: Error) => {
            }
        });
    }

    openInviteDialog(): void {
        const dialogRef = this.dialog.open(InviteDialogComponent, {
            width: '400px',
            data: { eventId: this.eventId }
        });

        dialogRef.afterClosed().subscribe((email: string) => {
            if (email) {
                this.eventService.inviteParticipant(this.eventId, email).subscribe({
                    next: () => {
                        this.loadParticipants();
                    },
                    error: (err: Error) => {
                    }
                });
            }
        });
    }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.eventService.uploadPhoto(this.eventId, file).subscribe({
        next: (newPhoto: Photo) => {
          this.photos = [newPhoto, ...this.photos];
          this.loadPhotos();
        },
        error: (err: Error) => {
          alert('Failed to upload photo.');
        }
      });
    }
  }

  formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    getAvatarColor(name: string): string {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        ];
        const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
        return colors[charCode % colors.length];
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'Confirmed': return 'check_circle';
            case 'Pending': return 'schedule';
            case 'Declined': return 'cancel';
            default: return 'help';
        }
    }

    openPhotoGallery(photoIndex: number): void {
        const dialogRef = this.dialog.open(PhotoGalleryComponent, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'photo-gallery-dialog',
            data: {
                photos: this.photos,
                initialIndex: photoIndex,
                eventId: this.eventId,
                isOrganizer: this.isOrganizer
            }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result && result.deleted) {
                // Reload photos after deletion
                this.loadPhotos();
            }
        });
    }

    deleteParticipant(participant: Participant): void {
        if (!participant.invitationId) {
            alert('Cannot delete: Invitation ID not found. Please refresh the page and try again.');
            return;
        }

        if (!confirm(`Are you sure you want to remove ${participant.name || participant.email} from this event?`)) {
            return;
        }

        this.eventService.deleteInvitation(this.eventId, participant.invitationId).subscribe({
            next: () => {
                this.loadParticipants();
            },
            error: (err: any) => {
                alert('Failed to delete participant: ' + (err.error?.error || err.message || 'Unknown error'));
            }
        });
    }

    onExcelFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            
            // Validate file type
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
                alert('Please select an Excel file (.xlsx or .xls) or CSV file (.csv)');
                return;
            }

            if (!confirm(`Import participants from ${file.name}?`)) {
                return;
            }

            this.eventService.importParticipantsFromExcel(this.eventId, file).subscribe({
                next: (result: any) => {
                    const message = `Import completed!\nTotal: ${result.total}\nSuccess: ${result.success}\nFailed: ${result.failed}`;
                    alert(message);
                    this.loadParticipants();
                    // Reset file input
                    input.value = '';
                },
                error: (err: any) => {
                    alert('Failed to import participants: ' + (err.error?.error || err.message || 'Unknown error'));
                    input.value = '';
                }
            });
        }
    }
}
