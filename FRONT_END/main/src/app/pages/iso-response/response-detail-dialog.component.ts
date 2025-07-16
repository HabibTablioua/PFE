import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-response-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <div style="padding: 28px 16px 16px 16px; min-width: 340px; max-width: 600px; background: #f9fafb; border-radius: 14px;">
      <h2 mat-dialog-title style="margin-bottom: 18px; font-size: 1.35rem; font-weight: 700; color: #2563eb; letter-spacing: 0.5px;">Détail de la réponse ISO</h2>
      <mat-dialog-content>
        <div style="display: flex; flex-direction: column; gap: 18px;">
          <div><b>ID :</b> {{ data.id }}</div>
          <div><b>MTI :</b> {{ data.mti }}</div>
          <div><b>Status :</b> <span [ngStyle]="{color: data.status === 'SUCCESS' ? '#43a047' : '#e53935', fontWeight: 600}">{{ data.status }}</span></div>
          <div><b>Date :</b> {{ data.createdAt | date:'short' }}</div>
          <div *ngIf="data.cause" style="margin-bottom: 10px;">
            <span style="color: #e53935; font-weight: 500; display: flex; align-items: center;">
              <mat-icon style="vertical-align: middle; margin-right: 6px;">error_outline</mat-icon>
              {{ data.cause }}
            </span>
          </div>
          <div *ngIf="getDetailValue('action')" style="margin-bottom: 10px;">
            <h4 style="margin: 10px 0 4px 0; color: #388e3c; display: flex; align-items: center; font-size: 1.08em;">
              <mat-icon style="margin-right: 6px;">check_circle</mat-icon>
              Solution proposée
            </h4>
            <div style="background: #e8f5e9; border-radius: 6px; padding: 10px 14px; color: #222; font-size: 1.08em;">
              {{ getDetailValue('action') }}
            </div>
          </div>
          <div *ngIf="parsedDetails && (detailsKeys().length > 0)">
            <h4 style="margin: 10px 0 4px 0; color: #1976d2;">Détails techniques</h4>
            <ul style="margin: 0 0 0 10px; padding: 0; list-style: disc;">
              <li *ngFor="let key of detailsKeys()" style="margin-bottom: 6px;">
                <span style="color: #1976d2; font-weight: 600;">{{ key }}</span>
                <span style="color: #222;">: {{ getDetailValue(key) }}</span>
              </li>
            </ul>
          </div>
          <div *ngIf="data.messageIso">
            <h4 style="margin: 10px 0 4px 0; color: #1976d2;">Message ISO généré</h4>
            <pre style="background: #f4f6fa; border-radius: 8px; padding: 10px; font-size: 0.98em; color: #222; overflow-x: auto; white-space: pre-wrap;">
{{ data.messageIso }}
            </pre>
          </div>
          <div><b>Champs ISO :</b>
            <pre style="background: #f4f6fa; border-radius: 8px; padding: 10px; font-size: 0.98em; color: #222; overflow-x: auto; white-space: pre-wrap;">
{{ parsedFields | json }}
            </pre>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="center" style="margin-top: 32px;">
        <button mat-raised-button mat-dialog-close class="close-btn-modern" style="background: #ef4444; color: #fff; border-radius: 8px; font-weight: 600; text-transform: uppercase; font-size: 0.95rem; box-shadow: 0 2px 8px #ef444422; padding: 7px 18px;">
          <span class="close-icon" aria-hidden="true">&times;</span>
          Fermer
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class ResponseDetailDialogComponent {
  parsedFields: any = {};
  parsedDetails: any = {};
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    try {
      this.parsedFields = data.fields ? JSON.parse(data.fields) : {};
    } catch {
      this.parsedFields = data.fields;
    }
    // Correction : parser details si c'est un string JSON
    if (data.details) {
      if (typeof data.details === 'string') {
        try {
          this.parsedDetails = JSON.parse(data.details);
        } catch {
          this.parsedDetails = { raw: data.details };
        }
      } else {
        this.parsedDetails = data.details;
      }
    }
  }
  detailsKeys(): string[] {
    return this.parsedDetails ? Object.keys(this.parsedDetails) : [];
  }
  getDetailValue(key: string): any {
    return this.parsedDetails ? this.parsedDetails[key] : '';
  }
} 