import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header" [ngClass]="'header-' + (data.type || 'warning')">
        <div class="header-content">
          <div class="header-icon-container">
            <mat-icon class="header-icon">
              {{ getIconForType(data.type) }}
            </mat-icon>
          </div>
          <div class="header-text">
            <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
          </div>
        </div>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="message-container">
          <p class="message-text">{{ data.message }}</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          <mat-icon>close</mat-icon>
          {{ data.cancelText || 'Annuler' }}
        </button>
        <button mat-raised-button (click)="onConfirm()" 
                [color]="getColorForType(data.type)" 
                class="confirm-btn">
          <mat-icon>{{ getConfirmIconForType(data.type) }}</mat-icon>
          {{ data.confirmText || 'Confirmer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 400px;
      max-width: 500px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      color: white;
      margin: -24px -24px 0 -24px;
    }

    .header-warning {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    }

    .header-danger {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    }

    .header-info {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
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
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: white;
    }

    .dialog-content {
      padding: 32px 0;
    }

    .message-container {
      padding: 0 24px;
    }

    .message-text {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
      color: #374151;
      text-align: center;
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
      transform: translateY(-16px);
    }

    .cancel-btn, .confirm-btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
      justify-content: center;
    }

    .cancel-btn {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .cancel-btn:hover {
      background: #e2e8f0;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .confirm-btn {
      background-color: #ffebee;
      color: #d32f2f;
      border-radius: 999px;
      padding: 0.7em 2em;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5em;
      box-shadow: none;
      transition: background 0.2s, color 0.2s;
    }

    .confirm-btn:hover {
      background-color: #ffcdd2;
      color: #b71c1c;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .confirm-btn .mat-icon {
      color: #d32f2f;
    }

    @media (max-width: 768px) {
      .confirmation-dialog {
        min-width: 95vw;
        max-width: 95vw;
      }
      
      .dialog-header {
        padding: 20px 24px;
      }
      
      .dialog-content {
        padding: 24px 0;
      }
      
      .message-container {
        padding: 0 16px;
      }
      
      .dialog-actions {
        padding: 20px 24px;
        flex-direction: column;
      }
      
      .cancel-btn, .confirm-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  getIconForType(type?: string): string {
    switch (type) {
      case 'danger':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'warning';
    }
  }

  getConfirmIconForType(type?: string): string {
    switch (type) {
      case 'danger':
        return 'delete';
      case 'info':
        return 'check';
      default:
        return 'check';
    }
  }

  getColorForType(type?: string): string {
    switch (type) {
      case 'danger':
        return 'warn';
      case 'info':
        return 'primary';
      default:
        return 'accent';
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
