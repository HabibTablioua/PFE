import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-card-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <mat-card class="card-summary-card">
      <mat-card-header>
        <div mat-card-avatar class="card-avatar">
          <mat-icon>{{ getCardTypeIcon(card.type) }}</mat-icon>
        </div>
        <mat-card-title>{{ card.holderName }}</mat-card-title>
        <mat-card-subtitle>{{ card.pan }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="card-info">
          <div class="info-row">
            <span class="label">Type:</span>
            <span class="value">{{ card.type }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Statut:</span>
            <mat-chip [color]="getStatusColor(card.status)" selected class="status-chip">
              {{ card.status }}
            </mat-chip>
          </div>
          
          <div class="info-row">
            <span class="label">Expiration:</span>
            <span class="value" [class.expired]="isExpired(card.expiryDate)">
              {{ card.expiryDate | date:'MM/yy' }}
            </span>
          </div>
        </div>

        <div class="flags-summary" *ngIf="hasFlags()">
          <div class="flag-item" *ngIf="card.stolen">
            <mat-icon class="flag-icon stolen">warning</mat-icon>
          </div>
          <div class="flag-item" *ngIf="card.lost">
            <mat-icon class="flag-icon lost">gps_off</mat-icon>
          </div>
          <div class="flag-item" *ngIf="card.blacklisted">
            <mat-icon class="flag-icon blacklisted">block</mat-icon>
          </div>
          <div class="flag-item" *ngIf="card.restricted">
            <mat-icon class="flag-icon restricted">lock</mat-icon>
          </div>
        </div>
      </mat-card-content>

      <mat-card-actions>
        <button mat-button color="primary" (click)="onViewDetails()">
          <mat-icon>visibility</mat-icon>
          Détails
        </button>
        <button mat-button color="accent" (click)="onEdit()">
          <mat-icon>edit</mat-icon>
          Modifier
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .card-summary-card {
      max-width: 350px;
      margin: 16px;
      transition: all 0.3s ease;
    }

    .card-summary-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .card-avatar {
      background: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-info {
      margin: 16px 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }

    .value {
      color: #1f2937;
      font-size: 0.9rem;
    }

    .status-chip {
      font-size: 0.8rem;
      height: 24px;
    }

    .expired {
      color: #ef4444;
      font-weight: 600;
    }

    .flags-summary {
      display: flex;
      gap: 8px;
      margin: 16px 0;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .flag-item {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .flag-icon {
      font-size: 20px;
    }

    .flag-icon.stolen {
      color: #ef4444;
    }

    .flag-icon.lost {
      color: #f59e0b;
    }

    .flag-icon.blacklisted {
      color: #7c3aed;
    }

    .flag-icon.restricted {
      color: #6b7280;
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      gap: 8px;
      justify-content: space-between;
    }

    mat-card-actions button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
  `]
})
export class CardSummaryComponent {
  @Input() card: any;
  @Output() viewDetails = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();

  getCardTypeIcon(type: string): string {
    switch (type?.toUpperCase()) {
      case 'CREDIT': return 'credit_card';
      case 'DEBIT': return 'account_balance_wallet';
      case 'PREPAID': return 'payment';
      default: return 'credit_card';
    }
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'primary';
      case 'BLOCKED': return 'warn';
      case 'EXPIRED': return 'accent';
      default: return 'primary';
    }
  }

  isExpired(expiryDate: string): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  }

  hasFlags(): boolean {
    return this.card && (this.card.stolen || this.card.lost || this.card.blacklisted || this.card.restricted);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.card);
  }

  onEdit(): void {
    this.edit.emit(this.card);
  }
} 