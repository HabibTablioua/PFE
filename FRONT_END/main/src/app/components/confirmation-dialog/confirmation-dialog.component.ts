import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TablerIconsModule } from 'angular-tabler-icons';

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
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TablerIconsModule
  ],
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">
          <i-tabler 
            [name]="getIconName()" 
            class="dialog-icon"
            [class]="'icon-' + data.type">
          </i-tabler>
          {{ data.title }}
        </h2>
      </div>
      
      <div class="dialog-content">
        <p class="dialog-message">{{ data.message }}</p>
      </div>
      
      <div class="dialog-actions">
        <button 
          mat-stroked-button 
          (click)="onCancel()"
          class="cancel-btn">
          {{ data.cancelText || 'Annuler' }}
        </button>
        <button 
          mat-flat-button 
          [color]="getButtonColor()"
          (click)="onConfirm()"
          class="confirm-btn">
          {{ data.confirmText || 'Confirmer' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      padding: 0;
      border-radius: 16px;
      overflow: hidden;
    }
    
    .dialog-header {
      background: linear-gradient(135deg, #B71C1C 0%, #F57C00 100%);
      color: white;
      padding: 24px 24px 16px 24px;
      
      .dialog-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        
        .dialog-icon {
          width: 24px;
          height: 24px;
          
          &.icon-warning {
            color: #FFC107;
          }
          
          &.icon-danger {
            color: #FF5722;
          }
          
          &.icon-info {
            color: #2196F3;
          }
        }
      }
    }
    
    .dialog-content {
      padding: 24px;
      
      .dialog-message {
        margin: 0;
        color: #333;
        font-size: 1rem;
        line-height: 1.5;
      }
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px 24px;
      border-top: 1px solid #f0f0f0;
      
      .cancel-btn {
        border-radius: 8px;
        padding: 12px 24px;
      }
      
      .confirm-btn {
        border-radius: 8px;
        padding: 12px 24px;
        font-weight: 500;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  getIconName(): string {
    switch (this.data.type) {
      case 'warning':
        return 'alert-triangle';
      case 'danger':
        return 'trash';
      case 'info':
        return 'info-circle';
      default:
        return 'help-circle';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'warning':
        return 'accent';
      default:
        return 'primary';
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
} 