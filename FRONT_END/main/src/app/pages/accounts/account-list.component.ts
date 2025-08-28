import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService, Account } from '../../services/account.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { AccountDeleteDialogComponent } from '../../components/account-delete-dialog/account-delete-dialog.component';
import { FormsModule } from '@angular/forms';
import { AccountEditDialogComponent } from './account-edit-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, MatCheckboxModule],
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
  styles: [`
    .account-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Styles pour le titre de la gestion des comptes */
    .account-title-section {
      background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
      border: none;
      border-radius: 20px;
      padding: 24px 32px;
      margin-bottom: 28px;
      box-shadow: 0 6px 24px rgba(34, 197, 94, 0.12);
      position: relative;
      overflow: hidden;
      transition: all 0.4s ease;
    }

    .account-title-section::before {
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

    .account-title-section:hover::before {
      transform: translateX(100%);
    }

    .account-title-section:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 36px rgba(34, 197, 94, 0.2);
    }

    .title-content {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 2;
    }

    .title-icon-container {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border-radius: 50%;
      padding: 14px;
      box-shadow: 0 6px 20px rgba(34, 197, 94, 0.25);
      transition: all 0.3s ease;
    }

    .title-icon-container:hover {
      transform: scale(1.08) rotate(5deg);
      box-shadow: 0 10px 28px rgba(34, 197, 94, 0.35);
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

    .account-title {
      color: #166534;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      letter-spacing: 0.4px;
      line-height: 1.2;
      text-shadow: 0 1px 3px rgba(22, 101, 52, 0.08);
    }

    .account-subtitle {
      color: #16a34a;
      font-size: 1rem;
      margin: 0;
      font-weight: 500;
      line-height: 1.4;
      letter-spacing: 0.2px;
    }

    /* Responsive pour le titre */
    @media (max-width: 768px) {
      .account-title-section {
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
      
      .account-title {
        font-size: 1.6rem;
      }
      
      .account-subtitle {
        font-size: 0.95rem;
      }
    }
    
    .header-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 24px;
    }

    /* Styles pour les boutons personnalisés */
    .add-account-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
      color: white !important;
      border: none !important;
      padding: 12px 24px !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3) !important;
      transition: all 0.3s ease !important;
    }

    .add-account-btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4) !important;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
    }

    .delete-all-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
      color: white !important;
      border: none !important;
      padding: 10px 20px !important;
      font-weight: 600 !important;
      border-radius: 10px !important;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
      transition: all 0.3s ease !important;
    }

    .delete-all-btn:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 18px rgba(239, 68, 68, 0.4) !important;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
    }

    .export-csv-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      color: white !important;
      border: none !important;
      padding: 10px 20px !important;
      font-weight: 600 !important;
      border-radius: 10px !important;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
      transition: all 0.3s ease !important;
    }

    .export-csv-btn:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4) !important;
      background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
    }

    .bulk-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .delete-selected-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      font-weight: 600;
      border-radius: 8px;
      border: 1px solid #ef4444;
      color: #ef4444;
      background: white;
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
    
    .search-section {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
      align-items: center;
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
    }

    .filter-toggle {
      display: flex;
      align-items: center;
    }

    .filter-button {
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .filter-button.active {
      background-color: #e3f2fd;
      color: #1976d2;
      border-color: #1976d2;
    }

    .filter-fields {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      width: 100%;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .filter-fields.hide {
      max-height: 0;
      opacity: 0;
      margin-top: 0;
      padding-top: 0;
      padding-bottom: 0;
    }

    .filter-fields.show {
      max-height: 200px;
      opacity: 1;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .filter-button:hover {
      background-color: #f5f5f5;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .filter-button.active:hover {
      background-color: #bbdefb;
    }

    .filter-fields mat-form-field {
      transition: all 0.3s ease;
    }

    .filter-fields.hide mat-form-field {
      transform: translateY(-10px);
    }

    .filter-fields.show mat-form-field {
      transform: translateY(0);
    }
    
    .account-card {
      margin-bottom: 16px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: box-shadow 0.3s ease;
    }
    
    .account-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    
    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .account-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .balance-high {
      color: #4caf50;
      font-weight: bold;
    }
    
    .balance-low {
      color: #f44336;
      font-weight: bold;
    }
    
    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-open {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .status-closed {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-suspended {
      background-color: #fff3e0;
      color: #ef6c00;
    }
    
    .table-container {
      overflow-x: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    /* Styles pour l'affichage esthétique de la date */
    .date-container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
    }

    .date-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      color: white;
      flex-shrink: 0;
    }

    .date-icon mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .date-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .date-main {
      font-weight: 600;
      font-size: 14px;
      color: #374151;
      line-height: 1.2;
    }

    .date-relative {
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.2;
    }

    /* Animation hover pour la date */
    .date-container:hover .date-icon {
      transform: scale(1.05);
      transition: transform 0.2s ease;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .date-container:hover .date-main {
      color: #1f2937;
      transition: color 0.2s ease;
    }

    .date-container:hover .date-relative {
      color: #4b5563;
      transition: color 0.2s ease;
    }

    /* Animation d'entrée pour les dates */
    .date-container {
      animation: fadeInUp 0.3s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Styles pour le bouton de suppression */
    .delete-btn {
      color: #dc2626 !important;
      background-color: rgba(220, 38, 38, 0.1) !important;
      border-radius: 8px !important;
      transition: all 0.2s ease !important;
    }

    .delete-btn:hover {
      color: #ffffff !important;
      background-color: #dc2626 !important;
      transform: scale(1.1) !important;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3) !important;
    }

    .delete-btn mat-icon {
      color: inherit !important;
    }

    /* Responsive pour les dates */
    @media (max-width: 768px) {
      .date-container {
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
      }
      
      .date-icon {
        width: 24px;
        height: 24px;
      }
      
      .date-icon mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
      
      .date-main {
        font-size: 13px;
      }
      
      .date-relative {
        font-size: 11px;
      }
    }
    
    .mat-table {
      width: 100%;
    }
    
    .mat-header-cell {
      font-weight: 600;
      color: #333;
      background-color: #f5f5f5;
    }
    
    .mat-cell {
      padding: 12px 8px;
    }
    
    .mat-row:hover {
      background-color: #f8f9fa;
    }

    .delete-btn {
      color: #dc2626;
    }

    .date-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .date-icon {
      color: #6b7280;
    }

    .date-icon mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .date-content {
      display: flex;
      flex-direction: column;
    }

    .date-main {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1f2937;
    }

    .date-relative {
      font-size: 0.75rem;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .account-container {
        padding: 16px;
      }
      
      .search-section {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filter-toggle {
        justify-content: center;
        margin-bottom: 12px;
      }
      
      .filter-fields {
        flex-direction: column;
      }
      
      .filter-fields mat-form-field {
        min-width: 100% !important;
      }
    }
  `]
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  loading = false;
  searchTerm = '';
  statusFilter = '';
  sortBy = 'date-desc'; // Tri par défaut : plus récents d'abord
  showFilters = false; // État d'affichage des filtres

  constructor(
    public accountService: AccountService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('AccountListComponent initialisé');
    this.loadAccounts();
  }

  createNewAccount(): void {
    console.log('Navigation vers le formulaire de création de compte');
    console.log('URL actuelle:', window.location.href);
    console.log('Router configuré:', this.router);
    
    this.router.navigate(['/accounts/new']).then(result => {
      console.log('Navigation réussie:', result);
    }).catch(error => {
      console.error('Erreur de navigation:', error);
      // Fallback: navigation directe
      window.location.href = '/accounts/new';
    });
  }

  loadAccounts(): void {
    console.log('Chargement des comptes...');
    console.log('Token JWT:', localStorage.getItem('token'));
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        console.log('Comptes chargés:', accounts);
        // Trier les comptes selon le critère sélectionné
        this.accounts = this.sortAccounts(accounts, this.sortBy);
        this.filteredAccounts = [...this.accounts]; // Copie pour éviter les références
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des comptes:', error);
        if (error.status === 401) {
          this.snackBar.open('Erreur d\'authentification. Veuillez vous reconnecter.', 'Fermer', { duration: 5000 });
        } else {
          this.snackBar.open('Erreur lors du chargement des comptes', 'Fermer', { duration: 3000 });
        }
        this.loading = false;
      }
    });
  }

  // Trier les comptes par date de création décroissante
  sortAccountsByDate(accounts: Account[]): Account[] {
    return accounts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Décroissant (plus récent en premier)
    });
  }

  // Méthode de tri générale
  sortAccounts(accounts: Account[], sortType: string): Account[] {
    switch (sortType) {
      case 'date-desc':
        return accounts.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      
      case 'date-asc':
        return accounts.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
      
      case 'name-asc':
        return accounts.sort((a, b) => {
          const nameA = (a.holderName || '').toLowerCase();
          const nameB = (b.holderName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      
      case 'name-desc':
        return accounts.sort((a, b) => {
          const nameA = (a.holderName || '').toLowerCase();
          const nameB = (b.holderName || '').toLowerCase();
          return nameB.localeCompare(nameA);
        });
      
      case 'balance-desc':
        return accounts.sort((a, b) => {
          const balanceA = a.balance || 0;
          const balanceB = b.balance || 0;
          return balanceB - balanceA;
        });
      
      case 'balance-asc':
        return accounts.sort((a, b) => {
          const balanceA = a.balance || 0;
          const balanceB = b.balance || 0;
          return balanceA - balanceB;
        });
      
      default:
        return this.sortAccountsByDate(accounts);
    }
  }

  // Gérer le changement de tri
  onSortChange(): void {
    this.applyFilters();
  }

  // Basculer l'affichage des filtres
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    console.log('Filtres affichés:', this.showFilters);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredAccounts = this.accounts.filter(account => {
      const matchesSearch = !this.searchTerm || 
        account.pan?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        account.holderName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        account.accountNumber?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || 
        account.status?.toLowerCase() === this.statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });

    // Maintenir le tri par date après filtrage
    this.filteredAccounts = this.sortAccounts(this.filteredAccounts, this.sortBy);
  }

  deleteAccount(account: Account): void {
    const dialogRef = this.dialog.open(AccountDeleteDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        accountPan: account.pan,
        accountHolderName: account.holderName
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.accountService.deleteAccount(account.pan).subscribe({
          next: () => {
            this.snackBar.open('Compte supprimé avec succès', 'Fermer', { duration: 3000 });
            // Supprimer le compte des listes locales sans recharger la page
            this.accounts = this.accounts.filter(a => a.pan !== account.pan);
            this.filteredAccounts = this.filteredAccounts.filter(a => a.pan !== account.pan);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression du compte', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'status-open';
      case 'CLOSED': return 'status-closed';
      case 'SUSPENDED': return 'status-suspended';
      default: return 'status-open';
    }
  }

  getBalanceClass(balance: number | undefined): string {
    if (!balance) return '';
    return balance > 1000 ? 'balance-high' : 'balance-low';
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copié dans le presse-papiers', 'Fermer', { duration: 2000 });
    });
  }

  editAccount(account: Account): void {
    console.log('Ouverture du dialogue de modification pour le compte:', account.pan);
    
    const dialogRef = this.dialog.open(AccountEditDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data: { account: account }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Compte mis à jour:', result);
        // Mettre à jour le compte dans la liste locale
        const index = this.accounts.findIndex(a => a.pan === account.pan);
        if (index > -1) {
          this.accounts[index] = result;
          // Re-trier les comptes
          this.accounts = this.sortAccounts(this.accounts, this.sortBy);
          // Mettre à jour les comptes filtrés
          this.applyFilters();
        }
        this.snackBar.open('Compte mis à jour avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteAllAccounts(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer TOUS les comptes (${this.filteredAccounts.length} comptes) ? Cette action est irréversible.`,
        confirmText: 'Supprimer tous',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        // Supprimer tous les comptes un par un
        const deletePromises = this.filteredAccounts.map(account => 
          this.accountService.deleteAccount(account.pan).toPromise()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.snackBar.open('Tous les comptes ont été supprimés', 'Fermer', { duration: 3000 });
            // Vider les listes locales sans recharger la page
            this.accounts = [];
            this.filteredAccounts = [];
            this.loading = false;
          })
          .catch(error => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression des comptes', 'Fermer', { duration: 3000 });
            this.loading = false;
          });
      }
    });
  }

  // Méthodes utilitaires pour le template
  getActiveAccountsCount(): number {
    return this.filteredAccounts.filter(a => this.accountService.isAccountActive(a)).length;
  }

  getTotalBalance(): number {
    return this.filteredAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  }

  getRelativeTime(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInDays > 0) {
        return diffInDays === 1 ? 'il y a 1 jour' : `il y a ${diffInDays} jours`;
      } else if (diffInHours > 0) {
        return diffInHours === 1 ? 'il y a 1 heure' : `il y a ${diffInHours} heures`;
      } else if (diffInMinutes > 0) {
        return diffInMinutes === 1 ? 'il y a 1 minute' : `il y a ${diffInMinutes} minutes`;
      } else {
        return 'à l\'instant';
      }
    } catch {
      return '';
    }
  }

  exportToCSV(): void {
    if (this.filteredAccounts.length === 0) {
      this.snackBar.open('Aucun compte à exporter', 'Fermer', { duration: 2000 });
      return;
    }

    // Créer le contenu CSV
    const headers = ['PAN', 'Titulaire', 'Numéro de compte', 'Solde', 'Devise', 'Type', 'Statut', 'Email', 'Date création'];
    const csvContent = [
      headers.join(','),
      ...this.filteredAccounts.map(account => [
        account.pan,
        account.holderName || '',
        account.accountNumber || '',
        account.balance || 0,
        account.currency || 'MAD',
        account.type || '',
        account.status || '',
        account.email || '',
        account.createdAt ? new Date(account.createdAt).toLocaleString('fr-FR') : ''
      ].join(','))
    ].join('\n');

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `comptes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Export CSV terminé', 'Fermer', { duration: 2000 });
  }

  // Propriétés et méthodes pour la sélection multiple
  selection = new SelectionModel<Account>(true, []);

  masterToggle(): void {
    this.isAllSelected() ? this.selection.clear() : this.filteredAccounts.forEach(row => this.selection.select(row));
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.filteredAccounts.length;
    return numSelected === numRows;
  }

  deleteSelectedAccounts(): void {
    if (this.selection.selected.length === 0) {
      this.snackBar.open('Aucun compte sélectionné pour suppression.', 'Fermer', { duration: 3000 });
      return;
    }

    const panList = this.selection.selected.map((account: any) => account.pan);
    if (confirm(`Êtes-vous sûr de vouloir supprimer les ${panList.length} comptes sélectionnés ?\n\n⚠️ ATTENTION : Toutes les cartes associées seront également supprimées !`)) {
      this.accountService.deleteMultipleAccounts(panList).subscribe({
        next: (response: any) => {
          this.loadAccounts();
          this.selection.clear();
          this.snackBar.open(`${response.totalAccountsDeleted} comptes supprimés avec succès. ${response.totalCardsDeleted} cartes supprimées.`, 'Fermer', { duration: 3000 });
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression des comptes sélectionnés:', error);
          this.snackBar.open('Erreur lors de la suppression des comptes sélectionnés', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
} 