import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Incident } from '../../models/incident.model';
import { CommonModule } from '@angular/common';
import { IncidentFormComponent } from '../incident-form/incident-form.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-incident-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, IncidentFormComponent, MatButtonModule],
  templateUrl: './incident-edit-dialog.component.html',
  styleUrls: ['./incident-edit-dialog.component.css']
})
export class IncidentEditDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<IncidentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { incident: Incident }
  ) {}

  onSubmit(incident: Partial<Incident>) {
    this.dialogRef.close(incident);
  }

  onCancel() {
    this.dialogRef.close();
  }
} 