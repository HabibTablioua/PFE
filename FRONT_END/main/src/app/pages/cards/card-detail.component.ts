import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule],
  template: `
    <mat-card class="card-detail-card">
      <mat-card-header>
        <div mat-card-avatar class="card-avatar">
          <mat-icon>{{ getCardTypeIcon(card.type) }}</mat-icon>
        </div>
        <mat-card-title>{{ card.holderName }}</mat-card-title>
        <mat-card-subtitle>{{ card.pan }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="card-info-grid">
          <div class="info-item">
            <label>Type:</label>
            <span class="value">{{ card.type }}</span>
          </div>
          
          <div class="info-item">
            <label>Statut:</label>
            <mat-chip [color]="getStatusColor(card.status)" selected>
              {{ card.status }}
            </mat-chip>
          </div>
          
          <div class="info-item">
            <label>Expiration:</label>
            <span class="value" [class.expired]="isExpired(card.expiryDate)">
              {{ card.expiryDate | date:'MM/yy' }}
            </span>
          </div>
          
          <div class="info-item">
            <label>Émetteur:</label>
            <span class="value">{{ card.issuer || 'Non spécifié' }}</span>
          </div>
          
          <div class="info-item full-width">
            <label>Opérations autorisées:</label>
            <span class="value">{{ card.allowedOperations || 'Toutes' }}</span>
          </div>
        </div>

        <div class="flags-section" *ngIf="hasFlags()">
          <h4>Alertes et restrictions</h4>
          <div class="flags-grid">
            <div class="flag-item" *ngIf="card.stolen">
              <mat-icon class="flag-icon stolen">warning</mat-icon>
              <span>Carte volée</span>
            </div>
            <div class="flag-item" *ngIf="card.lost">
              <mat-icon class="flag-icon lost">gps_off</mat-icon>
              <span>Carte perdue</span>
            </div>
            <div class="flag-item" *ngIf="card.blacklisted">
              <mat-icon class="flag-icon blacklisted">block</mat-icon>
              <span>Carte blacklistée</span>
            </div>
            <div class="flag-item" *ngIf="card.restricted">
              <mat-icon class="flag-icon restricted">lock</mat-icon>
              <span>Carte restreinte</span>
            </div>
          </div>
        </div>
      </mat-card-content>

      <mat-card-actions>
        <button mat-button color="primary" (click)="onEdit()">
          <mat-icon>edit</mat-icon>
          Modifier
        </button>
        <button mat-button color="warn" (click)="onDelete()">
          <mat-icon>delete</mat-icon>
          Supprimer
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .card-detail-card {
      max-width: 600px;
      margin: 20px auto;
    }

    .card-avatar {
      background: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-item label {
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item .value {
      color: #1f2937;
      font-size: 1rem;
    }

    .expired {
      color: #ef4444;
      font-weight: 600;
    }

    .flags-section {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .flags-section h4 {
      margin: 0 0 16px 0;
      color: #374151;
      font-size: 1rem;
      font-weight: 600;
    }

    .flags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .flag-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 6px;
      color: #374151;
    }

    .flag-icon {
      font-size: 18px;
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
      gap: 12px;
    }
  `]
})
export class CardDetailComponent {
  @Input() card: any;

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

  onEdit(): void {
    // Émettre un événement pour la modification
    console.log('Modifier la carte:', this.card.pan);
  }

  onDelete(): void {
    // Émettre un événement pour la suppression
    console.log('Supprimer la carte:', this.card.pan);
  }
} 