import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-response-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div style="padding: 24px 8px 8px 8px; min-width: 340px; max-width: 600px;">
      <h2 mat-dialog-title style="margin-bottom: 16px; font-size: 1.3rem; font-weight: 600; color: #2563eb;">Détail de la réponse ISO</h2>
      <mat-dialog-content>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div><b>ID :</b> {{ data.id }}</div>
          <div><b>MTI :</b> {{ data.mti }}</div>
          <div><b>Status :</b> <span [ngStyle]="{color: data.status === 'SUCCESS' ? '#43a047' : '#e53935'}">{{ data.status }}</span></div>
          <div><b>Date :</b> {{ data.createdAt | date:'short' }}</div>
          <div *ngIf="data.cause"><b>Cause :</b> <span style="color: #e53935;">{{ data.cause }}</span></div>
          <div><b>Champs ISO :</b>
            <pre style="background: #f4f6fa; border-radius: 8px; padding: 10px; font-size: 0.98em; color: #222; overflow-x: auto; white-space: pre-wrap;">
{{ parsedFields | json }}
            </pre>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end" style="margin-top: 16px;">
        <button mat-stroked-button mat-dialog-close>Fermer</button>
      </mat-dialog-actions>
    </div>
  `
})
export class ResponseDetailDialogComponent {
  parsedFields: any = {};
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    try {
      this.parsedFields = data.fields ? JSON.parse(data.fields) : {};
    } catch {
      this.parsedFields = data.fields;
    }
  }
} 