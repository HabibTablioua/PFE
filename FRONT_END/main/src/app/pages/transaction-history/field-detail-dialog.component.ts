import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface FieldDetail {
  fieldNumber: string;
  fieldName: string;
  value: string;
  label: string;
  explanation?: string;
}

@Component({
  selector: 'app-field-detail-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="field-detail-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon-container">
            <mat-icon class="header-icon">visibility</mat-icon>
          </div>
          <div class="header-text">
            <h2 mat-dialog-title class="dialog-title">Détails des Champs ISO8583</h2>
            <p class="dialog-subtitle">Analyse complète de la transaction</p>
          </div>
        </div>
        <button mat-icon-button (click)="closeDialog()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="transaction-info-card">
          <div class="info-header">
            <mat-icon class="info-icon">info</mat-icon>
            <span>Informations de la Transaction</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Transaction ID</span>
              <span class="info-value">{{ data.transactionId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">MTI</span>
              <span class="info-value mti-badge">{{ data.mti }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Format</span>
              <span class="info-value format-badge">{{ data.format }}</span>
            </div>
          </div>
        </div>

        <div class="table-section">
          <div class="table-header">
            <h3 class="table-title">
              <mat-icon class="table-icon">table_chart</mat-icon>
              Détail des Champs ISO8583
            </h3>
            <span class="field-count">{{ data.fields.length }} champs</span>
          </div>
          
          <div class="table-container">
            <table mat-table [dataSource]="data.fields" class="field-detail-table">
              <ng-container matColumnDef="fieldNumber">
                <th mat-header-cell *matHeaderCellDef>Champ</th>
                <td mat-cell *matCellDef="let field">
                  <span class="field-number-badge">{{ field.fieldNumber }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="fieldName">
                <th mat-header-cell *matHeaderCellDef>Nom du champ</th>
                <td mat-cell *matCellDef="let field">{{ field.fieldName }}</td>
              </ng-container>

              <ng-container matColumnDef="value">
                <th mat-header-cell *matHeaderCellDef>Valeur</th>
                <td mat-cell *matCellDef="let field">
                  <span class="field-value" [title]="field.value">{{ field.value }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="label">
                <th mat-header-cell *matHeaderCellDef>Signification</th>
                <td mat-cell *matCellDef="let field">
                  <span class="field-label" [class.has-value]="field.label && field.label !== '-'">
                    {{ field.label || '-' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="explanation">
                <th mat-header-cell *matHeaderCellDef>Explication</th>
                <td mat-cell *matCellDef="let field">
                  <span class="field-explanation" [class.has-value]="field.explanation && field.explanation !== '-'">
                    {{ field.explanation || '-' }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="closeDialog()" class="close-action-btn">
          <mat-icon>close</mat-icon>
          Fermer
        </button>
        <button mat-raised-button color="primary" (click)="copyToClipboard()" class="copy-action-btn">
          <mat-icon>content_copy</mat-icon>
          Copier
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .field-detail-dialog {
      min-width: 900px;
      max-width: 1200px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: -24px -24px 0 -24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon-container {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      padding: 12px;
      backdrop-filter: blur(10px);
    }

    .header-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-text {
      display: flex;
      flex-direction: column;
    }

    .dialog-title {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .dialog-subtitle {
      margin: 4px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
      font-weight: 300;
    }

    .close-button {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    .dialog-content {
      padding: 32px 0;
      max-height: 70vh;
      overflow-y: auto;
    }

    .transaction-info-card {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 16px;
      padding: 24px;
      margin: 0 24px 32px 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 16px;
    }

    .info-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      color: #475569;
      font-weight: 600;
      font-size: 16px;
    }

    .info-icon {
      color: #3b82f6;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 4px 0;
    }

    .info-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
    }

    .mti-badge, .format-badge {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      display: inline-block;
      text-align: center;
      margin: 4px 0;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }

    .table-section {
      margin: 0 24px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #1e293b;
      font-size: 20px;
      font-weight: 700;
    }

    .table-icon {
      color: #3b82f6;
    }

    .field-count {
      background: #e0f2fe;
      color: #0369a1;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-left: 16px;
      box-shadow: 0 2px 8px rgba(3, 105, 161, 0.2);
    }

    .table-container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .field-detail-table {
      width: 100%;
      border-collapse: collapse;
    }

    .field-detail-table th {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      color: #475569;
      font-weight: 600;
      padding: 20px 16px;
      text-align: left;
      border-bottom: 2px solid #e2e8f0;
      font-size: 14px;
    }

    .field-detail-table td {
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
      font-size: 14px;
      margin: 2px 0;
    }

    .field-detail-table tr:hover {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .field-number-badge {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      display: inline-block;
      min-width: 30px;
      text-align: center;
      margin: 2px 4px;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
    }

    .field-value {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      background: #f1f5f9;
      padding: 8px 12px;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .field-label, .field-explanation {
      color: #64748b;
      line-height: 1.4;
    }

    .field-label.has-value, .field-explanation.has-value {
      color: #059669;
      font-weight: 500;
    }

    .dialog-actions {
      padding: 24px 32px;
      margin: 0 -24px -24px -24px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-top: 1px solid #e2e8f0;
      gap: 16px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .close-action-btn, .copy-action-btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 8px;
      min-width: 120px;
      justify-content: center;
    }

    .close-action-btn {
      margin-left: 0;
      margin-right: 16px;
    }

    .copy-action-btn {
      margin-left: 0;
      margin-right: 0;
    }

    .close-action-btn {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .close-action-btn:hover {
      background: #e2e8f0;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .copy-action-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .copy-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    @media (max-width: 768px) {
      .field-detail-dialog {
        min-width: 95vw;
        max-width: 95vw;
      }
      
      .dialog-header {
        padding: 20px 24px;
      }
      
      .dialog-content {
        padding: 24px 0;
      }
      
      .transaction-info-card,
      .table-section {
        margin: 0 16px 24px 16px;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .dialog-actions {
        padding: 20px 24px;
        flex-direction: column;
      }
      
      .close-action-btn, .copy-action-btn {
        width: 100%;
        justify-content: center;
      }
    }

    .dialog-content::-webkit-scrollbar {
      width: 8px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
      border-radius: 4px;
    }

    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
    }
  `]
})
export class FieldDetailDialogComponent {
  displayedColumns: string[] = ['fieldNumber', 'fieldName', 'value', 'label', 'explanation'];

  constructor(
    public dialogRef: MatDialogRef<FieldDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      transactionId: string;
      mti: string;
      format: string;
      fields: FieldDetail[];
    }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  copyToClipboard(): void {
    const fieldsText = this.data.fields
      .map(field => `${field.fieldNumber} - ${field.fieldName}: ${field.value}`)
      .join('\n');
    
    navigator.clipboard.writeText(fieldsText).then(() => {
      console.log('Détails copiés dans le presse-papiers');
    });
  }
}
