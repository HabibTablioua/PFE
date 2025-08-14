import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

export interface AlertData {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description: string;
  time: string;
  icon?: string;
  action?: string;
}

@Component({
  selector: 'app-alert-widget',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="alert-widget">
      <div class="alert-header">
        <h3 class="alert-title">🔔 Alertes Système</h3>
        <button mat-icon-button (click)="refreshAlerts()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>
      
      <div class="alerts-list">
        <div 
          class="alert-item" 
          [ngClass]="alert.type"
          *ngFor="let alert of alerts"
          (click)="onAlertClick(alert)">
          
          <div class="alert-icon">
            <mat-icon *ngIf="alert.icon">{{ alert.icon }}</mat-icon>
            <mat-icon *ngIf="!alert.icon">
              <ng-container [ngSwitch]="alert.type">
                <mat-icon *ngSwitchCase="'info'">info</mat-icon>
                <mat-icon *ngSwitchCase="'warning'">warning</mat-icon>
                <mat-icon *ngSwitchCase="'error'">error</mat-icon>
                <mat-icon *ngSwitchCase="'success'">check_circle</mat-icon>
              </ng-container>
            </mat-icon>
          </div>
          
          <div class="alert-content">
            <div class="alert-title">{{ alert.title }}</div>
            <div class="alert-description">{{ alert.description }}</div>
            <div class="alert-time">{{ alert.time }}</div>
          </div>
          
          <div class="alert-action" *ngIf="alert.action">
            <button mat-button color="primary" (click)="onActionClick(alert)">
              {{ alert.action }}
            </button>
          </div>
        </div>
        
        <div class="no-alerts" *ngIf="alerts.length === 0">
          <mat-icon>check_circle</mat-icon>
          <p>Aucune alerte active</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert-widget {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .alert-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .alert-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .alerts-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 4px solid transparent;
    }

    .alert-item:hover {
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .alert-item.info {
      background: rgba(34, 197, 94, 0.05);
      border-left-color: #22c55e;
    }

    .alert-item.warning {
      background: rgba(245, 158, 11, 0.05);
      border-left-color: #f59e0b;
    }

    .alert-item.error {
      background: rgba(239, 68, 68, 0.05);
      border-left-color: #ef4444;
    }

    .alert-item.success {
      background: rgba(34, 197, 94, 0.05);
      border-left-color: #22c55e;
    }

    .alert-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .alert-item.info .alert-icon {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .alert-item.warning .alert-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .alert-item.error .alert-icon {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .alert-item.success .alert-icon {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .alert-content {
      flex: 1;
      min-width: 0;
    }

    .alert-content .alert-title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
      font-size: 0.875rem;
    }

    .alert-description {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .alert-time {
      color: #9ca3af;
      font-size: 0.75rem;
    }

    .alert-action {
      flex-shrink: 0;
    }

    .no-alerts {
      text-align: center;
      padding: 40px 20px;
      color: #6b7280;
    }

    .no-alerts mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #22c55e;
      margin-bottom: 12px;
    }

    .no-alerts p {
      margin: 0;
      font-size: 0.875rem;
    }
  `]
})
export class AlertWidgetComponent {
  @Input() alerts: AlertData[] = [];
  @Output() alertClick = new EventEmitter<AlertData>();
  @Output() actionClick = new EventEmitter<AlertData>();
  @Output() refresh = new EventEmitter<void>();

  onAlertClick(alert: AlertData): void {
    this.alertClick.emit(alert);
  }

  onActionClick(alert: AlertData): void {
    this.actionClick.emit(alert);
  }

  refreshAlerts(): void {
    this.refresh.emit();
  }
} 