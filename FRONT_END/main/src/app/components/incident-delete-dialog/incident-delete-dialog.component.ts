import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-incident-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './incident-delete-dialog.component.html',
  styleUrls: ['./incident-delete-dialog.component.css']
})
export class IncidentDeleteDialogComponent {
  constructor(public dialogRef: MatDialogRef<IncidentDeleteDialogComponent>) {}

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
} 