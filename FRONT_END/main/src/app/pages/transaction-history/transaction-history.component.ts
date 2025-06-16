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
  `]
})
export class TransactionHistoryComponent implements OnInit {
  showHistoryArea: boolean = false;
  showFilterForm: boolean = false;
  filterForm: FormGroup;
  transactions: Transaction[] = [];
  dataSource: MatTableDataSource<Transaction>;
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
    { value: '', viewValue: 'Toutes' },
    { value: 'PackingISOService', viewValue: 'Packing ISO Service' },
    { value: 'ResponseISOService', viewValue: 'Response ISO Service' },
  ];

  displayedColumns: string[] = ['id', 'mti', 'format', 'date', 'status', 'detail', 'actions'];

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar) {
    this.filterForm = this.fb.group({
      mti: [''],
      format: [''],
      source: [''],
      startDate: [null],
      endDate: [null],
    });
    this.dataSource = new MatTableDataSource(this.transactions);
  }

  ngOnInit(): void {
    this.fetchTransactions();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Set custom sorting for date if needed (assuming date is string, convert to Date for proper sort)
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'date') {
        return new Date(item.createdAt).getTime();
      }
      return (item as any)[property];
    };
    this.sort.sortChange.subscribe(() => this.paginator.firstPage()); // Reset pagination when sorting
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
    if (formValue.startDate) params = params.append('startDate', formValue.startDate.toISOString());
    if (formValue.endDate) params = params.append('endDate', formValue.endDate.toISOString());

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Transaction[]>('http://localhost:8088/api/history', { headers: headers, params: params })
      .subscribe({
        next: (response: Transaction[]) => {
          // Sort by date descending by default
          this.transactions = response.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.dataSource.data = this.transactions;
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
    this.fetchTransactions();
    this.showFilterForm = false;
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
} 