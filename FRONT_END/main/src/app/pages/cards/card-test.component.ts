import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="test-container">
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Test de la Gestion des Cartes</mat-card-title>
          <mat-card-subtitle>Vérification des composants</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <p>Ce composant permet de tester la gestion des cartes bancaires.</p>
          
          <div class="test-actions">
            <button mat-raised-button color="primary" (click)="goToCardList()">
              <mat-icon>list</mat-icon>
              Liste des Cartes
            </button>
            
            <button mat-raised-button color="accent" (click)="goToDashboard()">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </button>
          </div>
          
          <div class="test-info">
            <h4>Composants créés :</h4>
            <ul>
              <li>✅ CardListComponent - Liste principale des cartes</li>
              <li>✅ CardFormDialogComponent - Formulaire de création/modification</li>
              <li>✅ CardDetailComponent - Affichage détaillé d'une carte</li>
              <li>✅ CardNavigationComponent - Navigation par onglets</li>
              <li>✅ CardSummaryComponent - Résumé d'une carte</li>
            </ul>
            
            <h4>Fonctionnalités :</h4>
            <ul>
              <li>✅ CRUD complet des cartes</li>
              <li>✅ Gestion des alertes et restrictions</li>
              <li>✅ Validation des données</li>
              <li>✅ Interface Material Design</li>
              <li>✅ Navigation intégrée</li>
            </ul>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .test-card {
      margin-bottom: 24px;
    }

    .test-actions {
      display: flex;
      gap: 16px;
      margin: 24px 0;
      flex-wrap: wrap;
    }

    .test-info {
      margin-top: 24px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .test-info h4 {
      color: #374151;
      margin: 16px 0 8px 0;
    }

    .test-info ul {
      margin: 8px 0;
      padding-left: 20px;
    }

    .test-info li {
      margin: 4px 0;
      color: #6b7280;
    }
  `]
})
export class CardTestComponent {
  constructor(private router: Router) {}

  goToCardList(): void {
    this.router.navigate(['/cards']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
} 