import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.scss'
})
export class PhotoGalleryComponent {
  photos = [
    { id: 1, uploader: 'Emma Wilson', time: '2 hours ago', likes: 24, imageUrl: '' },
    { id: 2, uploader: 'John Smith', time: '3 hours ago', likes: 18, imageUrl: '' },
    { id: 3, uploader: 'Lisa Brown', time: '5 hours ago', likes: 32, imageUrl: '' },
    { id: 4, uploader: 'Alex Lee', time: '1 day ago', likes: 45, imageUrl: '' },
    { id: 5, uploader: 'Tom Davis', time: '1 day ago', likes: 12, imageUrl: '' },
    { id: 6, uploader: 'Sarah Green', time: '2 days ago', likes: 20, imageUrl: '' },
  ];
}