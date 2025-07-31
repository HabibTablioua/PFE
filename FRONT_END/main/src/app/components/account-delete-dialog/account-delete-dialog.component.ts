import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AccountDeleteDialogData {
  accountPan: string;
  accountHolderName?: string;
}

@Component({
  selector: 'app-account-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="delete-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2>Confirmer la suppression</h2>
      </div>
      
      <div class="dialog-content">
        <p class="warning-message">
          Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est <strong>irréversible</strong>.
        </p>
        
        <div class="account-info">
          <div class="account-detail">
            <span class="label">PAN :</span>
            <span class="value">{{ data.accountPan }}</span>
          </div>
          <div class="account-detail" *ngIf="data.accountHolderName">
            <span class="label">Titulaire :</span>
            <span class="value">{{ data.accountHolderName }}</span>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button mat-stroked-button 
                (click)="onCancel()"
                class="cancel-btn">
          Annuler
        </button>
        <button mat-flat-button 
                (click)="onConfirm()"
                class="delete-btn">
          <mat-icon>delete</mat-icon>
          Supprimer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog {
      padding: 0;
      border-radius: 16px;
      overflow: hidden;
      max-width: 500px;
      width: 100%;
    }
    
    .dialog-header {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      color: white;
      padding: 24px 24px 16px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .warning-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #fbbf24;
    }
    
    .dialog-content {
      padding: 24px;
    }
    
    .warning-message {
      color: #374151;
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    
    .account-info {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      border: 1px solid #e5e7eb;
    }
    
    .account-detail {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .account-detail:last-child {
      margin-bottom: 0;
    }
    
    .label {
      font-weight: 600;
      color: #374151;
    }
    
    .value {
      font-family: 'Courier New', monospace;
      color: #1f2937;
      font-weight: 500;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px 24px;
      border-top: 1px solid #f0f0f0;
    }
    
    .cancel-btn {
      border-radius: 8px;
      padding: 12px 24px;
      color: #6b7280;
      border-color: #d1d5db;
    }
    
    .delete-btn {
      border-radius: 8px;
      padding: 12px 24px;
      background: #dc2626;
      color: white;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .delete-btn:hover:not(:disabled) {
      background: #b91c1c;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
    }
    
    .delete-btn:disabled {
      background: #9ca3af;
      color: #6b7280;
    }
    
    .delete-btn mat-icon {
      margin-right: 6px;
    }
  `]
})
export class AccountDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AccountDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AccountDeleteDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
} 