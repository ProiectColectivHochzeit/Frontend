import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Photo } from '../../services/event.service';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.scss'
})
export class PhotoGalleryComponent implements OnInit, OnDestroy {
  photos: Photo[] = [];
  currentIndex: number = 0;
  canDelete: boolean = true; // Anyone can delete photos
  isDeleting: boolean = false;
  eventId: string = '';
  isOrganizer: boolean = false;

  get currentPhoto(): Photo {
    return this.photos[this.currentIndex];
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { photos: Photo[], initialIndex: number, eventId: string, isOrganizer: boolean },
    private dialogRef: MatDialogRef<PhotoGalleryComponent>,
    private eventService: EventService,
    private authService: AuthService
  ) {
    this.photos = data.photos;
    this.currentIndex = data.initialIndex || 0;
    this.eventId = data.eventId;
    this.isOrganizer = data.isOrganizer;
  }

  ngOnInit(): void {
    // Anyone can delete photos
    this.canDelete = true;
    // Add keyboard event listeners
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  ngOnDestroy(): void {
    // Remove keyboard event listeners
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousPhoto();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextPhoto();
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  nextPhoto(): void {
    if (this.currentIndex < this.photos.length - 1) {
      this.currentIndex++;
    } else if (this.photos.length > 1) {
      // Loop to first photo
      this.currentIndex = 0;
    }
  }

  previousPhoto(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.photos.length > 1) {
      // Loop to last photo
      this.currentIndex = this.photos.length - 1;
    }
  }

  deletePhoto(): void {
    if (!this.canDelete || !this.currentPhoto) {
      return;
    }

    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    this.isDeleting = true;
    
    // Get publicId from the photo
    const publicId = this.currentPhoto.publicId || this.currentPhoto.id;
    
    if (!publicId) {
      alert('Cannot delete photo: Missing photo identifier.');
      this.isDeleting = false;
      return;
    }
    
    this.eventService.deletePhoto(publicId).subscribe({
      next: () => {
        // Remove photo from array
        this.photos.splice(this.currentIndex, 1);
        
        // If no photos left, close gallery
        if (this.photos.length === 0) {
          this.close();
          return;
        }
        
        // Adjust index if needed
        if (this.currentIndex >= this.photos.length) {
          this.currentIndex = this.photos.length - 1;
        }
        
        this.isDeleting = false;
        
        // Emit updated photos list back to parent
        this.dialogRef.close({ deleted: true, remainingPhotos: this.photos });
      },
      error: (err) => {
        alert('Failed to delete photo: ' + (err.error?.error || err.message || 'Unknown error'));
        this.isDeleting = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close({ deleted: false, remainingPhotos: this.photos });
  }

  closeOnBackdrop(event: MouseEvent): void {
    // Close if clicking on backdrop (not on content)
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
