import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { HttpClient, HttpClientModule, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';

interface Transaction {
  id: string;
  mti: string;
  format: string;
  source: string;
  status: string;
  createdAt: string;
  messageContent?: string; // Optional for detail view
  fieldsJson?: string; // Optional for detail view
}

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: [],
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule,
    MatSnackBarModule,
    AppHeaderComponent,
    ReactiveFormsModule,
  ],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate('0.5s ease-in-out')
      ])
    ]),
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  styles: [`
    .history-container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 30px;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      font-family: 'Inter', sans-serif;
    }

    .history-button-section {
      text-align: center;
      margin-bottom: 30px;
    }

    .filter-card {
      background-color: #f5f5f5; /* bg-neutral-100 */
      border-radius: 16px; /* rounded-2xl */
      padding: 24px; /* p-6 */
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 30px;
    }

    .filter-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .filter-actions {
      grid-column: 1 / -1; /* Make the actions div span all columns */
      display: flex;
      flex-direction: row;
      gap: 10px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .filter-actions button {
      flex: 1;
      min-width: 150px; /* Minimum width for buttons */
      padding: 12px 16px; /* Homogeneous padding */
      text-align: center;
      white-space: nowrap; /* Prevent text truncation */
      border-radius: 8px; /* Rounded corners */
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Light shadow */
      transition: all 0.3s ease-in-out; /* Smooth hover animation */
    }

    .filter-actions button.mat-raised-button {
      background-color: #e0f2f7; /* Soft background color (light blue) */
      color: #0d47a1; /* Blue text color */
    }

    .filter-actions button.mat-raised-button:hover {
      background-color: #bbdefb; /* hover:bg-blue-50 equivalent, slightly darker blue */
      transform: translateY(-2px); /* Slight lift on hover */
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15); /* Slightly stronger shadow on hover */
    }

    /* Override Angular Material default colors for 'warn' and 'accent' if needed */
    .filter-actions button.mat-raised-button.mat-warn {
      background-color: #ffebee; /* Light red for warn */
      color: #c62828; /* Dark red text */
    }

    .filter-actions button.mat-raised-button.mat-warn:hover {
      background-color: #ffcdd2; /* Darker red on hover */
    }

    .filter-actions button.mat-raised-button.mat-accent {
      background-color: #e3f2fd; /* Light blue for accent (matching primary) */
      color: #1565c0; /* Darker blue text */
    }

    .filter-actions button.mat-raised-button.mat-accent:hover {
      background-color: #90caf9; /* Darker blue on hover */
    }

    .download-actions-container {
      display: flex;
      flex-direction: row;
      gap: 10px;
      justify-content: flex-end;
      flex-wrap: wrap;
      margin-top: 20px; /* Add some space above the download buttons */
      padding: 24px; /* Match filter-card padding */
      background-color: #f5f5f5; /* Match filter-card background */
      border-radius: 16px; /* Match filter-card border-radius */
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); /* Match filter-card shadow */
    }

    .download-actions-container button {
      flex: 1;
      min-width: 150px; /* Minimum width for buttons */
      padding: 12px 16px; /* Homogeneous padding */
      text-align: center;
      white-space: nowrap; /* Prevent text truncation */
      border-radius: 8px; /* Rounded corners */
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Light shadow */
      transition: all 0.3s ease-in-out; /* Smooth hover animation */
    }

    .download-actions-container button.mat-raised-button {
      background-color: #e0f2f7; /* Soft background color (light blue) */
      color: #0d47a1; /* Blue text color */
    }

    .download-actions-container button.mat-raised-button:hover {
      background-color: #bbdefb; /* hover:bg-blue-50 equivalent, slightly darker blue */
      transform: translateY(-2px); /* Slight lift on hover */
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15); /* Slightly stronger shadow on hover */
    }

    .delete-all-button-container {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 15px;
      padding: 0 15px; /* Add some horizontal padding to align with table */
    }

    .transaction-table-container {
      overflow-x: auto;
      margin-top: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    th {
      background-color: #f0f0f0;
      font-weight: 600;
      color: #333;
    }

    tr:hover {
      background-color: #f9f9f9;
    }

    .mat-column-detail {
      width: 80px;
      text-align: center;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px; /* Equivalent to gap-1 in Tailwind (1 unit = 4px) */
      padding: 4px 12px; /* Equivalent to px-3 py-1 in Tailwind */
      border-radius: 9999px; /* Equivalent to rounded-full in Tailwind */
      font-size: 0.875rem; /* Equivalent to text-sm in Tailwind */
      font-weight: 500; /* Equivalent to font-medium in Tailwind */
    }

    .status-success {
      background-color: #d1fae5; /* bg-green-100 */
      color: #047857; /* text-green-700 */
    }

    .status-failed {
      background-color: #fee2e2; /* bg-red-100 */
      color: #b91c1c; /* text-red-700 */
    }

    .status-icon {
      font-size: 1.1rem; /* Adjust icon size if needed */
    }

    .detail-row {
      height: 0;
    }

    .element-row:not(.expanded-row) {
      cursor: pointer;
    }

    .element-row:not(.expanded-row):hover {
      background: whitesmoke;
    }

    .element-row.expanded-row {
      border-bottom-color: transparent;
    }

    .transaction-detail-content {
      overflow: hidden;
      display: flex;
      background-color: #1a202c;
      color: #a7f3d0;
      padding: 20px;
      border-radius: 8px;
      margin-top: 10px;
      font-family: 'monospace', 'Consolas', 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .copy-detail-button {
      margin-left: auto; /* Push to the right */
      margin-top: 10px;
    }

    @media (max-width: 768px) {
      .history-container {
        margin: 20px;
        padding: 20px;
      }
      .filter-form {
        grid-template-columns: 1fr;
      }
      .filter-actions {
        flex-direction: column;
      }
    }

    .filter-buttons-container {
      display: flex;
      flex-direction: row;
      gap: 10px;
      justify-content: flex-end;
      flex-wrap: wrap;
      margin-top: 20px; /* Add some space above the filter buttons */
      padding: 24px; /* Match filter-card padding */
      background-color: #f5f5f5; /* Match filter-card background */
      border-radius: 16px; /* Match filter-card border-radius */
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); /* Match filter-card shadow */
    }

    .filter-buttons-container button {
      flex: 1;
      min-width: 150px; /* Minimum width for buttons */
      padding: 12px 16px; /* Homogeneous padding */
      text-align: center;
      white-space: nowrap; /* Prevent text truncation */
      border-radius: 8px; /* Rounded corners */
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Light shadow */
      transition: all 0.3s ease-in-out; /* Smooth hover animation */
    }

    .filter-buttons-container button.mat-raised-button {
      background-color: #e0f2f7; /* Soft background color (light blue) */
      color: #0d47a1; /* Blue text color */
    }

    .filter-buttons-container button.mat-raised-button:hover {
      background-color: #bbdefb; /* hover:bg-blue-50 equivalent, slightly darker blue */
      transform: translateY(-2px); /* Slight lift on hover */
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15); /* Slightly stronger shadow on hover */
    }
  `]
})
export class TransactionHistoryComponent implements OnInit {
  showHistoryArea: boolean = false;
  showFilterForm: boolean = false;
  filterForm: FormGroup;
  transactions: Transaction[] = [];
  dataSource: MatTableDataSource<Transaction>;
  selection = new SelectionModel<Transaction>(true, []);
  expandedElement: Transaction | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  mtiOptions = [
    { value: '', viewValue: 'Tous' },
    { value: '0100', viewValue: '0100 – Demande d’autorisation' },
    { value: '0110', viewValue: '0110 – Réponse à la demande d’autorisation' },
    { value: '0200', viewValue: '0200 – Demande financière (achat/retrait)' },
    { value: '0210', viewValue: '0210 – Réponse à une demande financière' },
    { value: '0220', viewValue: '0220 – Conseil de transaction' },
    { value: '0230', viewValue: '0230 – Réponse au conseil de transaction' },
    { value: '0400', viewValue: '0400 – Demande d’annulation (reversal)' },
    { value: '0410', viewValue: '0410 – Réponse à une annulation' },
    { value: '0420', viewValue: '0420 – Avis d’annulation' },
    { value: '0430', viewValue: '0430 – Réponse à l’avis d’annulation' },
    { value: '0800', viewValue: '0800 – Requête de gestion réseau' },
    { value: '0810', viewValue: '0810 – Réponse de gestion réseau' },
  ];

  formatOptions = [
    { value: '', viewValue: 'Tous' },
    { value: 'ASCII', viewValue: 'ASCII' },
    { value: 'HEX', viewValue: 'HEX' },
  ];

  sourceOptions = [
    { value: 'FRONTEND', viewValue: 'FRONTEND' },
    { value: 'BACKEND', viewValue: 'BACKEND' },
  ];

  displayedColumns: string[] = ['select', 'id', 'mti', 'format', 'date', 'status', 'detail', 'actions'];

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar) {
    this.filterForm = this.fb.group({
      mti: [''],
      format: [''],
      source: [''],
      startDate: [null],
      endDate: [null],
      searchTerm: [''],
    });
    this.dataSource = new MatTableDataSource(this.transactions);
  }

  ngOnInit(): void {
    this.fetchTransactions();
  }

  ngAfterViewInit() {

  }

  toggleHistoryArea(): void {
    this.showHistoryArea = !this.showHistoryArea;
    if (this.showHistoryArea) {
      this.fetchTransactions();
    } else {
      this.resetFilter();
      this.showFilterForm = false;
    }
  }

  showFilter(): void {
    this.showFilterForm = true;
  }

  fetchTransactions(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open('Authentification requise pour voir l\'historique.', 'Fermer', { duration: 3000 });
      return;
    }

    let params = new HttpParams();
    const formValue = this.filterForm.value;

    if (formValue.mti) params = params.append('mti', formValue.mti);
    if (formValue.format) params = params.append('format', formValue.format);
    if (formValue.source) params = params.append('source', formValue.source);
    if (formValue.startDate) params = params.append('startDate', this.formatDateForApi(formValue.startDate));
    if (formValue.endDate) params = params.append('endDate', this.formatDateForApi(formValue.endDate));
    if (formValue.searchTerm) params = params.append('searchTerm', formValue.searchTerm);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Transaction[]>('http://localhost:8088/api/history', { headers: headers, params: params })
      .subscribe({
        next: (data) => {
          this.transactions = data;
          this.dataSource.data = this.transactions;
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
          this.snackBar.open('Historique chargé avec succès !', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'historique des transactions:', error);
          this.snackBar.open('Erreur lors du chargement de l\'historique.', 'Fermer', { duration: 5000 });
          this.transactions = [];
          this.dataSource.data = [];
        }
      });
  }

  applyFilter(): void {
    const formValue = this.filterForm.value;

    // Check if all filter fields are empty (including new searchTerm)
    const isFormEmpty = !formValue.mti && !formValue.format && !formValue.source && !formValue.startDate && !formValue.endDate && !formValue.searchTerm;

    if (isFormEmpty) {
      this.snackBar.open('Veuillez spécifier au moins un critère de recherche.', 'Fermer', { duration: 3000 });
      return;
    }

    this.fetchTransactions();
    // this.showFilterForm = false; // Commented out to keep filter form visible
  }

  resetFilter(): void {
    this.filterForm.reset();
    // Reset all form controls to empty strings or null as per initial state
    this.filterForm.patchValue({
      mti: '',
      format: '',
      source: '',
      startDate: null,
      endDate: null,
      searchTerm: '', // Reset search term
    });
    this.fetchTransactions(); // Fetch all transactions again after reset
    this.showFilterForm = false;
  }

  showTransactionDetail(transaction: Transaction): void {
    this.expandedElement = this.expandedElement === transaction ? null : transaction;
  }

  copyDetail(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      this.snackBar.open('Détail copié !', 'Fermer', { duration: 2000 });
    }).catch(err => {
      console.error('Erreur lors de la copie: ', err);
      this.snackBar.open('Impossible de copier le détail.', 'Fermer', { duration: 3000 });
    });
  }

  getStatusClass(status: string): string {
    return status.toUpperCase() === 'SUCCESS' ? 'status-success' : 'status-failed';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  deleteTransaction(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      const token = localStorage.getItem('token');
      if (!token) {
        this.snackBar.open('Authentification requise pour supprimer la transaction.', 'Fermer', { duration: 3000 });
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.delete(`http://localhost:8088/api/history/${id}`, { headers: headers })
        .subscribe({
          next: () => {
            this.snackBar.open('Transaction supprimée avec succès !', 'Fermer', { duration: 3000 });
            this.fetchTransactions(); // Refresh the table
          },
          error: (error) => {
            console.error('Erreur lors de la suppression de la transaction:', error);
            this.snackBar.open('Erreur lors de la suppression de la transaction.', 'Fermer', { duration: 5000 });
          }
        });
    }
  }

  deleteSelectedTransactions(): void {
    if (this.selection.selected.length === 0) {
      this.snackBar.open('Veuillez sélectionner les transactions à supprimer.', 'Fermer', { duration: 3000 });
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer les transactions sélectionnées ?')) {
      const token = localStorage.getItem('token');
      if (!token) {
        this.snackBar.open('Authentification requise pour supprimer les transactions.', 'Fermer', { duration: 3000 });
        return;
      }

      const selectedIds = this.selection.selected.map(tx => tx.id);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      // Make a POST request to a new batch delete endpoint with selected IDs
      this.http.post('http://localhost:8088/api/history/delete-batch', selectedIds, { headers: headers })
        .subscribe({
          next: () => {
            this.snackBar.open('Transactions sélectionnées supprimées avec succès !', 'Fermer', { duration: 3000 });
            this.fetchTransactions(); // Refresh the table
            this.selection.clear(); // Clear selection
          },
          error: (error) => {
            console.error('Erreur lors de la suppression des transactions sélectionnées:', error);
            this.snackBar.open('Erreur lors de la suppression des transactions sélectionnées.', 'Fermer', { duration: 5000 });
          }
        });
    }
  }

  downloadPdfReport(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open('Token d\'authentification non trouvé. Veuillez vous connecter.', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.selection.selected.length === 0) {
      this.snackBar.open('Veuillez sélectionner au moins une transaction pour générer le rapport PDF.', 'Fermer', { duration: 3000 });
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Important for sending request body
    });

    this.snackBar.open('Génération du rapport PDF...', 'Fermer');

    // Change from GET to POST and send selected transactions in the body
    this.http.post(`http://localhost:8088/api/history/export/pdf`, this.selection.selected, { headers, responseType: 'blob' }).subscribe({
      next: (response: Blob) => {
        const fileURL = URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `rapport_transactions_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
        this.snackBar.open('Rapport PDF téléchargé avec succès !', 'Fermer', { duration: 3000 });
        this.selection.clear(); // Clear selection after successful download
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du téléchargement du rapport PDF.', 'Fermer', { duration: 3000 });
        console.error('Erreur de téléchargement PDF:', error);
      }
    });
  }

  downloadExcelReport(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open('Token d\'authentification non trouvé. Veuillez vous connecter.', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.selection.selected.length === 0) {
      this.snackBar.open('Veuillez sélectionner au moins une transaction pour générer le rapport Excel.', 'Fermer', { duration: 3000 });
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Important for sending request body
    });

    this.snackBar.open('Génération du rapport Excel...', 'Fermer');

    // Change from GET to POST and send selected transactions in the body
    this.http.post(`http://localhost:8088/api/history/export/excel`, this.selection.selected, { headers, responseType: 'blob' }).subscribe({
      next: (response: Blob) => {
        const fileURL = URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `rapport_transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
        this.snackBar.open('Rapport Excel téléchargé avec succès !', 'Fermer', { duration: 3000 });
        this.selection.clear(); // Clear selection after successful download
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du téléchargement du rapport Excel.', 'Fermer', { duration: 3000 });
        console.error('Erreur de téléchargement Excel:', error);
      }
    });
  }

  downloadCsvReport(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open('Token d\'authentification non trouvé. Veuillez vous connecter.', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.selection.selected.length === 0) {
      this.snackBar.open('Veuillez sélectionner au moins une transaction pour générer le rapport CSV.', 'Fermer', { duration: 3000 });
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Important for sending request body
    });

    this.snackBar.open('Génération du rapport CSV...', 'Fermer');

    // Change from GET to POST and send selected transactions in the body
    this.http.post(`http://localhost:8088/api/history/export/csv`, this.selection.selected, { headers, responseType: 'blob' }).subscribe({
      next: (response: Blob) => {
        const fileURL = URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `rapport_transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
        this.snackBar.open('Rapport CSV téléchargé avec succès !', 'Fermer', { duration: 3000 });
        this.selection.clear(); // Clear selection after successful download
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du téléchargement du rapport CSV.', 'Fermer', { duration: 3000 });
        console.error('Erreur de téléchargement CSV:', error);
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Transaction): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
} 