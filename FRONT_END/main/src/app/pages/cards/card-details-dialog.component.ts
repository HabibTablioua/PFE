import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { OperationsMappingService } from '../../services/operations-mapping.service';

export interface CardDetailsData {
  pan: string;
  cardNumber?: string;
  holderName: string;
  type: string;
  status: string;
  issuer?: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  stolen: boolean;
  lost: boolean;
  blacklisted: boolean;
  restricted: boolean;
  allowedOperations?: string;
  accountPan?: string;
}

@Component({
  selector: 'app-card-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-content">
          <div class="card-icon">
            <mat-icon>credit_card</mat-icon>
          </div>
          <div class="header-text">
            <h2>Détails de la Carte</h2>
            <p>{{ data.pan }}</p>
          </div>
        </div>
        <button mat-icon-button class="close-button" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div class="content-grid">
          <!-- Informations principales -->
          <div class="info-section">
            <div class="section-header">
              <mat-icon>info</mat-icon>
              <h3>Informations principales</h3>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Titulaire</span>
                <span class="value">{{ data.holderName }}</span>
              </div>
              <div class="info-item">
                <span class="label">Type</span>
                <span class="value">{{ data.type }}</span>
              </div>
              <div class="info-item">
                <span class="label">Statut</span>
                <mat-chip [color]="getStatusColor(data.status)" selected>
                  {{ data.status }}
                </mat-chip>
              </div>
              <div class="info-item">
                <span class="label">Émetteur</span>
                <span class="value">{{ data.issuer || 'Non spécifié' }}</span>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="info-section">
            <div class="section-header">
              <mat-icon>schedule</mat-icon>
              <h3>Dates importantes</h3>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Expiration</span>
                <span class="value" [class.expired]="isExpired(data.expiryDate)">
                  {{ data.expiryDate | date:'dd/MM/yyyy' }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Créée le</span>
                <span class="value">{{ data.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Modifiée le</span>
                <span class="value">{{ data.updatedAt | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          </div>

          <!-- Alertes et restrictions -->
          <div class="info-section">
            <div class="section-header">
              <mat-icon>warning</mat-icon>
              <h3>Alertes et restrictions</h3>
            </div>
            <div class="alerts-grid">
              <div class="alert-item" [class.active]="data.stolen">
                <mat-icon [class.warning]="data.stolen">theft</mat-icon>
                <span>Volée</span>
                <mat-chip [color]="data.stolen ? 'warn' : 'default'" selected>
                  {{ data.stolen ? 'OUI' : 'NON' }}
                </mat-chip>
              </div>
              <div class="alert-item" [class.active]="data.lost">
                <mat-icon [class.warning]="data.lost">gps_off</mat-icon>
                <span>Perdue</span>
                <mat-chip [color]="data.lost ? 'warn' : 'default'" selected>
                  {{ data.lost ? 'OUI' : 'NON' }}
                </mat-chip>
              </div>
              <div class="alert-item" [class.active]="data.blacklisted">
                <mat-icon [class.warning]="data.blacklisted">block</mat-icon>
                <span>Blacklistée</span>
                <mat-chip [color]="data.blacklisted ? 'warn' : 'default'" selected>
                  {{ data.blacklisted ? 'OUI' : 'NON' }}
                </mat-chip>
              </div>
              <div class="alert-item" [class.active]="data.restricted">
                <mat-icon [class.warning]="data.restricted">lock</mat-icon>
                <span>Restreinte</span>
                <mat-chip [color]="data.restricted ? 'warn' : 'default'" selected>
                  {{ data.restricted ? 'OUI' : 'NON' }}
                </mat-chip>
              </div>
            </div>
          </div>

          <!-- Opérations autorisées -->
          <div class="info-section">
            <div class="section-header">
              <mat-icon>payment</mat-icon>
              <h3>Opérations autorisées</h3>
            </div>
            <div class="operations-content">
              <div *ngIf="data.allowedOperations; else noOperations" class="operations-list">
                <div *ngFor="let code of getAllowedOperationsCodes()" class="operation-item">
                  <mat-icon class="operation-icon">{{ getOperationIcon(code) }}</mat-icon>
                  <div class="operation-details">
                    <span class="operation-code">{{ code }}</span>
                    <span class="operation-description">{{ getOperationDescription(code) }}</span>
                  </div>
                </div>
              </div>
              <ng-template #noOperations>
                <p class="no-data">Aucune restriction spécifiée</p>
              </ng-template>
            </div>
          </div>

          <!-- Compte associé -->
          <div class="info-section">
            <div class="section-header">
              <mat-icon>account_balance</mat-icon>
              <h3>Account number</h3>
            </div>
            <div class="account-content">
              <p>Account number</p>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button class="secondary-button" (click)="close()">
          <mat-icon>close</mat-icon>
          Fermer
        </button>
        <button mat-raised-button color="primary" (click)="editCard()">
          <mat-icon>edit</mat-icon>
          Modifier la carte
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 20px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .card-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .header-text h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .header-text p {
      margin: 4px 0 0 0;
      color: #6b7280;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }

    .close-button {
      color: #6b7280;
    }

    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .content-grid {
      display: grid;
      gap: 24px;
    }

    .info-section {
      background: #f9fafb;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e5e7eb;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .section-header mat-icon {
      color: #3b82f6;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      font-size: 0.875rem;
      color: #1f2937;
      font-weight: 500;
    }

    .expired {
      color: #ef4444;
      font-weight: 600;
    }

    .alerts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;
    }

    .alert-item.active {
      background: #fef2f2;
      border-color: #fecaca;
    }

    .alert-item mat-icon {
      color: #6b7280;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .alert-item.active mat-icon {
      color: #ef4444;
    }

    .alert-item span {
      flex: 1;
      font-size: 0.875rem;
      color: #374151;
      font-weight: 500;
    }

    .operations-content, .account-content {
      background: white;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .operations-content p, .account-content p {
      margin: 0;
      color: #374151;
      font-size: 0.875rem;
    }

    .no-data {
      color: #6b7280;
      font-style: italic;
    }

    .operations-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .operation-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 8px;
      border: 1px solid #bae6fd;
      transition: all 0.3s ease;
    }

    .operation-item:hover {
      transform: translateX(4px);
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      border-color: #0ea5e9;
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.2);
    }

    .operation-icon {
      color: #0ea5e9;
      font-size: 20px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 6px;
      padding: 4px;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.15);
    }

    .operation-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .operation-code {
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 600;
      background: white;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }

    .operation-description {
      font-size: 0.875rem;
      color: #1e40af;
      font-weight: 600;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px 24px 24px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .secondary-button {
      color: #6b7280;
    }

    .mat-chip.mat-standard-chip {
      font-size: 0.75rem;
      height: 24px;
    }
  `]
})
export class CardDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CardDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CardDetailsData,
    private operationsService: OperationsMappingService
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  editCard(): void {
    this.dialogRef.close({ action: 'edit', card: this.data });
  }

  /**
   * Récupère la liste des codes d'opérations
   */
  getAllowedOperationsCodes(): string[] {
    if (!this.data.allowedOperations) return [];
    return this.data.allowedOperations.split(',').map(code => code.trim());
  }

  /**
   * Récupère l'icône d'une opération
   */
  getOperationIcon(code: string): string {
    const operation = this.operationsService.getOperation(code);
    return operation ? operation.icon : 'help';
  }

  /**
   * Récupère la description d'une opération
   */
  getOperationDescription(code: string): string {
    return this.operationsService.getDescription(code);
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
} 