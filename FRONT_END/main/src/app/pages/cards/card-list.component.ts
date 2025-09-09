import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { CardFormDialogComponent } from './card-form-dialog.component';
import { CardNavigationComponent } from './card-navigation.component';
import { CardService, Card, CardStats } from '../../services/card.service';
import { CardDetailsDialogComponent } from './card-details-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    CardFormDialogComponent,
    CardNavigationComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule
  ],
  animations: [
    trigger('titleSlideIn', [
      state('void', style({ 
        opacity: 0, 
        transform: 'translateY(-30px)' 
      })),
      transition(':enter', [
        animate('0.8s ease-out', style({ 
          opacity: 1, 
          transform: 'translateY(0)' 
        }))
      ])
    ])
  ],
  template: `
    <div class="container">
      <app-card-navigation></app-card-navigation>

      <!-- Titre stylé pour la gestion des cartes -->
      <div class="card-title-section" @titleSlideIn>
        <div class="title-content">
          <div class="title-icon-container">
            <mat-icon class="title-icon">credit_card</mat-icon>
          </div>
          <div class="title-text">
            <h1 class="card-title">Gestion des Cartes</h1>
            <p class="card-subtitle">Gérez et surveillez toutes vos cartes bancaires en temps réel</p>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="stat-card total">
          <div class="stat-number">{{ totalCards }}</div>
          <div class="stat-label">Total Cartes</div>
        </div>
        <div class="stat-card active">
          <div class="stat-number">{{ activeCards }}</div>
          <div class="stat-label">Actives</div>
        </div>
        <div class="stat-card blocked">
          <div class="stat-number">{{ blockedCards }}</div>
          <div class="stat-label">Bloquées</div>
        </div>
        <div class="stat-card expired">
          <div class="stat-number">{{ expiredCards }}</div>
          <div class="stat-label">Expirées</div>
        </div>
      </div>

      <div class="filters-section">
        <button mat-raised-button color="primary" class="add-card-button" (click)="navigateToNewCard()">
          <mat-icon>add</mat-icon>
          Ajouter une carte
        </button>
        
        <button mat-stroked-button color="primary" class="filter-button" (click)="toggleFilters()">
          <mat-icon>{{ showFilters ? 'visibility_off' : 'filter_list' }}</mat-icon>
          {{ showFilters ? 'Masquer les filtres' : 'Afficher les filtres' }}
        </button>
        
        <button mat-stroked-button color="warn" class="delete-selected-button" 
                [disabled]="selection.selected.length === 0" 
                (click)="deleteSelectedCards()">
          <mat-icon>delete_sweep</mat-icon>
          Supprimer la sélection ({{ selection.selected.length }})
        </button>
      </div>

      <div class="filters-interface" *ngIf="showFilters">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher une carte</mat-label>
            <input matInput placeholder="Rechercher une carte" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="status-field">
            <mat-label>Statut</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilters()">
              <mat-option value="">Tous les statuts</mat-option>
              <mat-option value="ACTIVE">Active</mat-option>
              <mat-option value="BLOCKED">Bloquée</mat-option>
              <mat-option value="EXPIRED">Expirée</mat-option>
              <mat-option value="SUSPENDED">Suspendue</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="sort-field">
            <mat-label>Trier par</mat-label>
            <mat-select [(ngModel)]="selectedSort" (ngModelChange)="applyFilters()">
              <mat-option value="recent">Plus récents d'abord</mat-option>
              <mat-option value="oldest">Plus anciens d'abord</mat-option>
              <mat-option value="name">Nom du titulaire</mat-option>
              <mat-option value="type">Type de carte</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button color="primary" class="refresh-button" (click)="refreshCards()">
            <mat-icon>refresh</mat-icon>
            Actualiser
          </button>
        </div>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="dataSource" class="cards-table">

          <!-- Checkbox Column -->
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox (change)="$event ? masterToggle() : null"
                            [checked]="selection.hasValue() && isAllSelected()"
                            [indeterminate]="selection.hasValue() && !isAllSelected()">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox (click)="$event.stopPropagation()"
                            (change)="$event ? selection.toggle(row) : null"
                            [checked]="selection.isSelected(row)">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- PAN Column -->
          <ng-container matColumnDef="pan">
            <th mat-header-cell *matHeaderCellDef>PAN</th>
            <td mat-cell *matCellDef="let card">
              <div class="pan-cell">
                <span class="pan-number">{{ card.pan }}</span>
                <mat-icon class="card-type-icon" [matTooltip]="card.type">
                  {{ getCardTypeIcon(card.type) }}
                </mat-icon>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="holderName">
            <th mat-header-cell *matHeaderCellDef>Titulaire</th>
            <td mat-cell *matCellDef="let card">{{ card.holderName }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let card">
              <mat-chip [color]="getStatusColor(card.status)" selected>
                {{ card.status }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let card">
              <span class="card-type">{{ card.type }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="expiryDate">
            <th mat-header-cell *matHeaderCellDef>Expiration</th>
            <td mat-cell *matCellDef="let card">
              <span [class.expired]="isExpired(card.expiryDate)">
                {{ card.expiryDate | date:'MM/yy' }}
              </span>
            </td>
          </ng-container>

          <!-- Colonne : Statut détaillé de la carte -->
          <ng-container matColumnDef="alertStatus">
            <th mat-header-cell *matHeaderCellDef>Statut détaillé</th>
            <td mat-cell *matCellDef="let card">
              <div class="detailed-status">
                <span class="status-badge" [ngClass]="getStatusClass(card)">
                  {{ getDetailedStatus(card) }}
                </span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let card">
              <div class="actions-container">
                <button mat-icon-button color="primary" (click)="viewCardDetails(card)" matTooltip="Voir les détails">
                  <mat-icon class="view-icon">visibility</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="editCard(card)" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteCard(card.pan)" matTooltip="Supprimer">
                  <mat-icon class="delete-icon">delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="dataSource.data.length === 0" class="no-data">
          <mat-icon>credit_card_off</mat-icon>
          <p>Aucune carte trouvée</p>
          <button mat-raised-button color="primary" (click)="navigateToNewCard()">
            Créer votre première carte
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    /* Styles pour le titre de la gestion des cartes */
    .card-title-section {
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      border: none;
      border-radius: 20px;
      padding: 24px 32px;
      margin-bottom: 28px;
      box-shadow: 0 6px 24px rgba(139, 92, 246, 0.12);
      position: relative;
      overflow: hidden;
      transition: all 0.4s ease;
    }

    .card-title-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.08) 50%, transparent 70%);
      transform: translateX(-100%);
      transition: transform 0.6s ease;
    }

    .card-title-section:hover::before {
      transform: translateX(100%);
    }

    .card-title-section:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 36px rgba(139, 92, 246, 0.2);
    }

    .title-content {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 2;
    }

    .title-icon-container {
      background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
      border-radius: 50%;
      padding: 14px;
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.25);
      transition: all 0.3s ease;
    }

    .title-icon-container:hover {
      transform: scale(1.08) rotate(5deg);
      box-shadow: 0 10px 28px rgba(139, 92, 246, 0.35);
    }

    .title-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .title-text {
      flex: 1;
    }

    .card-title {
      color: #3730a3;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      letter-spacing: 0.4px;
      line-height: 1.2;
      text-shadow: 0 1px 3px rgba(55, 48, 163, 0.08);
    }

    .card-subtitle {
      color: #6366f1;
      font-size: 1rem;
      margin: 0;
      font-weight: 500;
      line-height: 1.4;
      letter-spacing: 0.2px;
    }

    /* Responsive pour le titre */
    @media (max-width: 768px) {
      .card-title-section {
        padding: 20px 16px;
        margin-bottom: 24px;
      }
      
      .title-content {
        flex-direction: column;
        text-align: center;
        gap: 14px;
      }
      
      .title-icon-container {
        padding: 12px;
      }
      
      .title-icon {
        font-size: 1.8rem;
        width: 1.8rem;
        height: 1.8rem;
      }
      
      .card-title {
        font-size: 1.6rem;
      }
      
      .card-subtitle {
        font-size: 0.95rem;
      }
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .title-section h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .title-section p {
      margin: 0;
      color: #6b7280;
      font-size: 1.1rem;
    }

    .add-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-weight: 600;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 28px 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
      border-left: 4px solid #e5e7eb;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      border-left-width: 6px;
    }

    .stat-card.active {
      border-left-color: #10b981;
    }

    .stat-card.active:hover {
      border-left-color: #059669;
      background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
    }

    .stat-card.blocked {
      border-left-color: #ef4444;
    }

    .stat-card.blocked:hover {
      border-left-color: #dc2626;
      background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
    }

    .stat-card.expired {
      border-left-color: #f59e0b;
    }

    .stat-card.expired:hover {
      border-left-color: #d97706;
      background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
    }

    .stat-card.total {
      border-left-color: #3b82f6;
    }

    .stat-card.total:hover {
      border-left-color: #1d4ed8;
      background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .stat-label {
      color: #6b7280;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .add-card-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-weight: 600;
      border-radius: 12px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
    }

    .add-card-button:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .filter-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-weight: 600;
      border-radius: 12px;
      border: 1px solid #3b82f6;
      color: #3b82f6;
      transition: all 0.3s ease;
    }

    .filter-button:hover {
      background-color: #eff6ff;
      border-color: #1d4ed8;
      color: #1d4ed8;
    }

    .delete-selected-button {
      margin-left: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-weight: 600;
      border-radius: 12px;
      border: 1px solid #ef4444;
      color: #ef4444;
      transition: all 0.3s ease;
    }

    .delete-selected-button:hover:not(:disabled) {
      background-color: #fef2f2;
      border-color: #dc2626;
      color: #dc2626;
    }

    .delete-selected-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .filters-interface {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
      border: 1px solid #f1f5f9;
      padding: 24px;
      margin-bottom: 32px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
    }

    .search-field, .status-field, .sort-field {
      flex: 1;
      min-width: 200px;
    }

    .refresh-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-weight: 600;
      border-radius: 12px;
      border: 1px solid #3b82f6;
      color: #3b82f6;
      transition: all 0.3s ease;
    }

    .refresh-button:hover {
      background-color: #eff6ff;
      border-color: #1d4ed8;
      color: #1d4ed8;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
      border: 1px solid #f1f5f9;
    }

    .cards-table {
      width: 100%;
      border-collapse: collapse;
    }

    .pan-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pan-number {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #1f2937;
    }

    .card-type-icon {
      font-size: 18px;
      color: #6b7280;
    }

    .card-type {
      text-transform: capitalize;
      font-weight: 500;
      color: #374151;
    }

    .expired {
      color: #ef4444;
      font-weight: 600;
    }

    .actions-container {
      display: flex;
      gap: 4px;
      justify-content: center;
    }

    .actions-container button {
      transition: all 0.2s ease;
      border-radius: 6px;
    }

    .actions-container button:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .delete-icon {
      color: #dc2626 !important;
    }

    .view-icon {
      color: #3b82f6 !important;
    }

    .detailed-status {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
    }

    .debug-info {
      font-size: 9px;
      color: #9ca3af;
      font-family: 'Courier New', monospace;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
      min-width: 90px;
      text-align: center;
      border: 1px solid;
      transition: all 0.2s ease;
    }

    .status-badge.stolen {
      background-color: #fef2f2;
      color: #dc2626;
      border-color: #fecaca;
    }

    .status-badge.lost {
      background-color: #fffbeb;
      color: #d97706;
      border-color: #fed7aa;
    }

    .status-badge.blacklisted {
      background-color: #f3f4f6;
      color: #7c3aed;
      border-color: #e5e7eb;
    }

    .status-badge.restricted {
      background-color: #f9fafb;
      color: #6b7280;
      border-color: #e5e7eb;
    }

    .status-badge.expired {
      background-color: #fffbeb;
      color: #d97706;
      border-color: #fed7aa;
    }

    .status-badge.normal {
      background-color: #f0fdf4;
      color: #059669;
      border-color: #bbf7d0;
    }

    .status-badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .no-data {
      text-align: center;
      padding: 48px 24px;
      color: #6b7280;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #d1d5db;
    }

    .no-data p {
      margin: 0 0 24px 0;
      font-size: 1.1rem;
    }

    th.mat-header-cell {
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
      padding: 16px;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
    }

    td.mat-cell {
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
      color: #475569;
      font-size: 0.875rem;
      vertical-align: middle;
    }

    tr.mat-row:hover {
      background: #f8fafc;
      transition: background 0.2s ease;
    }

    tr.mat-row:last-child td.mat-cell {
      border-bottom: none;
    }
  `]
})
export class CardListComponent implements OnInit {
  displayedColumns: string[] = ['select', 'pan', 'holderName', 'status', 'type', 'expiryDate', 'alertStatus', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  
  totalCards = 0;
  activeCards = 0;
  blockedCards = 0;
  expiredCards = 0;

  showFilters = false;
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedSort: string = 'recent';
  allCards: Card[] = [];

  selection = new SelectionModel<any>(true, []);

  constructor(
    private cardService: CardService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCards();
    this.loadStats();
    
    // Vérifier les paramètres de route pour ouvrir automatiquement le formulaire
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        this.openCardForm();
      }
    });

    // Écouter les changements des filtres
    this.setupFilterListeners();
  }

  setupFilterListeners(): void {
    // Écouter les changements de recherche
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedSort = 'recent';
  }

  applyFilters(): void {
    let filteredCards = [...this.allCards];

    // Filtrage par recherche
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredCards = filteredCards.filter(card => 
        card.pan.toLowerCase().includes(searchLower) ||
        card.holderName.toLowerCase().includes(searchLower) ||
        card.type.toLowerCase().includes(searchLower) ||
        card.issuer?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrage par statut
    if (this.selectedStatus) {
      filteredCards = filteredCards.filter(card => 
        this.getDetailedStatus(card) === this.selectedStatus
      );
    }

    // Tri
    switch (this.selectedSort) {
      case 'recent':
        filteredCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filteredCards.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name':
        filteredCards.sort((a, b) => a.holderName.localeCompare(b.holderName));
        break;
      case 'type':
        filteredCards.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }

    this.dataSource.data = filteredCards;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  refreshCards(): void {
    this.loadCards();
    this.loadStats();
    this.snackBar.open('Cartes actualisées', 'Fermer', { duration: 2000 });
  }

  loadCards(): void {
    console.log('🔄 Chargement des cartes...');
    this.cardService.getAllCards().subscribe({
      next: (cards: Card[]) => {
        console.log('✅ Cartes chargées:', cards);
        this.allCards = cards;
        this.dataSource.data = cards;
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du chargement des cartes:', error);
        this.snackBar.open('Erreur lors du chargement des cartes', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadStats(): void {
    console.log('🔄 Chargement des statistiques...');
    this.cardService.getCardStats().subscribe({
      next: (stats: CardStats) => {
        console.log('✅ Statistiques chargées:', stats);
        this.totalCards = stats.totalCards;
        this.activeCards = stats.activeCards;
        this.blockedCards = stats.blockedCards;
        this.expiredCards = stats.expiredCards;
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  navigateToNewCard(): void {
    this.router.navigate(['/cards/new']);
  }

  openCardForm(card?: any): void {
    const dialogRef = this.dialog.open(CardFormDialogComponent, {
      width: '600px',
      data: card || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCards();
        this.loadStats();
        this.snackBar.open(
          card ? 'Carte mise à jour avec succès' : 'Carte créée avec succès',
          'Fermer',
          { duration: 3000 }
        );
      }
    });
  }

  editCard(card: any): void {
    this.openCardForm(card);
  }

  viewCardDetails(card: Card): void {
    console.log('🔍 Affichage des détails de la carte:', card);
    
    const dialogRef = this.dialog.open(CardDetailsDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        pan: card.pan,
        cardNumber: card.cardNumber,
        holderName: card.holderName,
        type: card.type,
        status: card.status,
        issuer: card.issuer,
        expiryDate: card.expiryDate,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        stolen: card.stolen,
        lost: card.lost,
        blacklisted: card.blacklisted,
        restricted: card.restricted,
        allowedOperations: card.allowedOperations,
        accountPan: card.accountPan
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'edit') {
        this.editCard(result.card);
      }
    });
  }

  deleteCard(pan: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la carte ${pan} ?`)) {
      this.cardService.deleteCard(pan).subscribe({
        next: () => {
          this.loadCards();
          this.loadStats();
          this.snackBar.open('Carte supprimée avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression de la carte', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  deleteSelectedCards(): void {
    if (this.selection.selected.length === 0) return;

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${this.selection.selected.length} carte(s) ?`;
    if (confirm(confirmMessage)) {
      const deletePromises = this.selection.selected.map(card => 
        this.cardService.deleteCard(card.pan).toPromise()
      );

      Promise.all(deletePromises).then(() => {
        this.selection.clear();
        this.loadCards();
        this.loadStats();
        this.snackBar.open(`${this.selection.selected.length} carte(s) supprimée(s) avec succès`, 'Fermer', { duration: 3000 });
      }).catch(error => {
        console.error('Erreur lors de la suppression en masse:', error);
        this.snackBar.open('Erreur lors de la suppression en masse', 'Fermer', { duration: 3000 });
      });
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

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

  getDetailedStatus(card: Card): string {
    console.log('🔍 Carte analysée:', card);
    
    if (card.stolen) return 'Volée';
    if (card.lost) return 'Perdue';
    if (card.blacklisted) return 'Blacklistée';
    if (card.restricted) return 'Restreinte';
    if (this.isExpired(card.expiryDate)) return 'Expirée';
    
    return 'Normale';
  }

  getStatusClass(card: Card): string {
    if (card.stolen) {
      return 'stolen';
    }
    if (card.lost) {
      return 'lost';
    }
    if (card.blacklisted) {
      return 'blacklisted';
    }
    if (card.restricted) {
      return 'restricted';
    }
    if (this.isExpired(card.expiryDate)) {
      return 'expired';
    }
    return 'normal';
  }
} 
