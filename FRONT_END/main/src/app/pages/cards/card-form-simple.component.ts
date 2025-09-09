import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card-form-simple',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="container">
      <!-- En-tête de la page -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <mat-icon>credit_card</mat-icon>
          </div>
          <div class="header-text">
            <h1>Nouvelle Carte</h1>
            <p>Créez une nouvelle carte bancaire avec toutes les informations nécessaires</p>
          </div>
        </div>
        <button mat-stroked-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Retour à la liste
        </button>
      </div>

      <!-- Formulaire de création de carte -->
      <mat-card class="form-card">
        <mat-card-content>
          <h2>Formulaire de création de carte</h2>
          <p>Ce composant fonctionne ! Le design s'applique correctement.</p>
          
          <!-- Boutons d'action -->
          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()">
              <mat-icon>cancel</mat-icon>
              Annuler
            </button>
            <button mat-raised-button color="primary" type="button" (click)="testSubmit()">
              <mat-icon>save</mat-icon>
              Tester la soumission
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-icon {
      background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
      border-radius: 50%;
      padding: 16px;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    }

    .header-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: white;
    }

    .header-text h1 {
      margin: 0 0 8px 0;
      color: #3730a3;
      font-size: 2rem;
      font-weight: 700;
    }

    .header-text p {
      margin: 0;
      color: #6366f1;
      font-size: 1rem;
    }

    .form-card {
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      gap: 24px;
      padding: 32px 0;
      border-top: 1px solid #e5e7eb;
      margin-top: 32px;
    }

    .form-actions button {
      min-width: 160px;
      height: 48px;
      font-weight: 600;
      border-radius: 12px;
    }

    .mat-mdc-raised-button.mat-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
    }

    .mat-mdc-raised-button.mat-primary:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }

    .mat-mdc-stroked-button {
      border: 2px solid #6b7280;
      color: #6b7280;
    }

    .mat-mdc-stroked-button:hover {
      border-color: #374151;
      color: #374151;
      background: #f9fafb;
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .form-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class CardFormSimpleComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/cards']);
  }

  testSubmit(): void {
    alert('Le composant fonctionne correctement !');
  }
}

