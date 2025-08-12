import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-response-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatTableModule],
  template: `
    <div style="padding: 28px 16px 16px 16px; min-width: 340px; max-width: 800px; background: #f9fafb; border-radius: 14px;">
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
          <div *ngIf="isoFields.length > 0">
            <h4 style="margin: 10px 0 8px 0; color: #1976d2; font-size: 1.08em;">Champs ISO</h4>
            <div style="background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <table mat-table [dataSource]="isoFields" style="width: 100%;">
                <ng-container matColumnDef="field">
                  <th mat-header-cell *matHeaderCellDef style="background: #f8f9fa; color: #495057; font-weight: 600; padding: 12px 16px; border-bottom: 2px solid #dee2e6;">Champ</th>
                  <td mat-cell *matCellDef="let element" style="padding: 12px 16px; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #2563eb;">{{ element.field }}</td>
                </ng-container>
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef style="background: #f8f9fa; color: #495057; font-weight: 600; padding: 12px 16px; border-bottom: 2px solid #dee2e6;">Nom du champ</th>
                  <td mat-cell *matCellDef="let element" style="padding: 12px 16px; border-bottom: 1px solid #e9ecef; color: #6c757d;">{{ element.name }}</td>
                </ng-container>
                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef style="background: #f8f9fa; color: #495057; font-weight: 600; padding: 12px 16px; border-bottom: 2px solid #dee2e6;">Valeur</th>
                  <td mat-cell *matCellDef="let element" style="padding: 12px 16px; border-bottom: 1px solid #e9ecef; font-family: 'Courier New', monospace; background: #f8f9fa; color: #212529;">{{ element.value }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
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
  isoFields: any[] = [];
  displayedColumns: string[] = ['field', 'name', 'value'];

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
    
    // Convertir les champs ISO en tableau pour l'affichage
    this.isoFields = this.convertFieldsToTableData();
  }

  convertFieldsToTableData(): any[] {
    const fields = this.parsedFields;
    const tableData: any[] = [];
    
    if (fields && typeof fields === 'object') {
      Object.keys(fields).forEach(key => {
        // Exclure le champ 52 (PIN) de l'affichage
        if (key !== '52') {
          tableData.push({
            field: key,
            name: this.getFieldName(key),
            value: fields[key]
          });
        }
      });
    }
    
    // Trier par numéro de champ
    return tableData.sort((a, b) => parseInt(a.field) - parseInt(b.field));
  }

  getFieldName(fieldNumber: string): string {
    const fieldNames: { [key: string]: string } = {
      '0': 'Message Type Indicator',
      '1': 'Bitmap',
      '2': 'Primary Account Number',
      '3': 'Processing Code',
      '4': 'Amount, Transaction',
      '5': 'Amount, Reconciliation',
      '6': 'Amount, Cardholder Billing',
      '7': 'Transmission Date & Time',
      '8': 'Amount, Cardholder Billing Fee',
      '9': 'Conversion Rate, Reconciliation',
      '10': 'Conversion Rate, Cardholder Billing',
      '11': 'Systems Trace Audit Number',
      '12': 'Time, Local Transaction',
      '13': 'Date, Local Transaction',
      '14': 'Date, Expiration',
      '15': 'Date, Settlement',
      '16': 'Date, Conversion',
      '17': 'Date, Capture',
      '18': 'Merchant Type',
      '19': 'Acquiring Institution Country Code',
      '20': 'PAN Extended, Country Code',
      '21': 'Forwarding Institution Country Code',
      '22': 'Point of Service Entry Mode',
      '23': 'Application PAN Sequence Number',
      '24': 'Function Code',
      '25': 'Point of Service Condition Code',
      '26': 'Point of Service Capture Code',
      '27': 'Authorizing Identification Response Length',
      '28': 'Amount, Transaction Fee',
      '29': 'Amount, Settlement Fee',
      '30': 'Amount, Transaction Processing Fee',
      '31': 'Amount, Settlement Processing Fee',
      '32': 'Acquiring Institution Identification Code',
      '33': 'Forwarding Institution Identification Code',
      '34': 'Primary Account Number, Extended',
      '35': 'Track 2 Data',
      '36': 'Track 3 Data',
      '37': 'Retrieval Reference Number',
      '38': 'Authorization Identification Response',
      '39': 'Response Code',
      '40': 'Service Restriction Code',
      '41': 'Card Acceptor Terminal Identification',
      '42': 'Card Acceptor Identification Code',
      '43': 'Card Acceptor Name/Location',
      '44': 'Additional Response Data',
      '45': 'Track 1 Data',
      '46': 'Additional Data - ISO',
      '47': 'Additional Data - National',
      '48': 'Additional Data - Private',
      '49': 'Currency Code, Transaction',
      '60': 'Custom Text Field'
    };
    
    return fieldNames[fieldNumber] || `Champ ${fieldNumber}`;
  }

  detailsKeys(): string[] {
    return this.parsedDetails ? Object.keys(this.parsedDetails) : [];
  }
  
  getDetailValue(key: string): any {
    return this.parsedDetails ? this.parsedDetails[key] : '';
  }
} 