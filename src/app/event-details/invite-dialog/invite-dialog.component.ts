import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-invite-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './invite-dialog.component.html',
    styleUrl: './invite-dialog.component.scss'
})
export class InviteDialogComponent {
    email: string = '';
    isValid: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<InviteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { eventId: string }
    ) { }

    validateEmail(): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.isValid = emailRegex.test(this.email);
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onInvite(): void {
        if (this.isValid) {
            this.dialogRef.close(this.email);
        }
    }
}
