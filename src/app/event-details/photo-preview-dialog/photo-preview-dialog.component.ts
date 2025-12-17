import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface PhotoPreviewDialogData {
  url: string;
  uploaderName: string;
  uploadedAt: string;
}

@Component({
  selector: 'app-photo-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './photo-preview-dialog.component.html',
  styleUrl: './photo-preview-dialog.component.scss',
})
export class PhotoPreviewDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<PhotoPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PhotoPreviewDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
