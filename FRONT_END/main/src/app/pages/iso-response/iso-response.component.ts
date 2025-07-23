import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ResponseDetailDialogComponent } from './response-detail-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-iso-response',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCheckboxModule, // Ajouté pour mat-checkbox
  ],
  templateUrl: './iso-response.component.html',
  styleUrls: ['./iso-response.component.css']
})
export class IsoResponseComponent implements OnInit {
  form: FormGroup;
  response: any = null;
  displayedColumns: string[] = ['id', 'mti', 'status', 'createdAt', 'rrn', 'actions'];
  allColumns: string[] = ['select', 'id', 'mti', 'status', 'createdAt', 'rrn', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  showFilterPanel = false;
  filterForm: FormGroup;
  statusOptions = ['SUCCESS', 'FAILED'];
  selection = new SelectionModel<any>(true, []);

  constructor(private fb: FormBuilder, private http: HttpClient, private dialog: MatDialog, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      isoMessage: ['']
    });
    this.filterForm = this.fb.group({
      mti: [''],
      status: [''],
      startDate: [''],
      endDate: [''],
      keyword: ['']
    });
  }

  ngOnInit() {
    this.loadAllResponses();
  }

  loadAllResponses() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    this.http.get<any[]>('http://localhost:8088/api/response/history', { headers })
      .subscribe(res => {
        this.dataSource.data = res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  submit() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    this.http.post('http://localhost:8088/api/response-iso', this.form.value, { headers })
      .subscribe(res => {
        this.response = res;
        this.loadAllResponses();
      });
  }

  showDetails(element: any) {
    this.dialog.open(ResponseDetailDialogComponent, {
      data: element,
      width: '600px'
    });
  }

  onDeleteAllResponses() {
    if (confirm('Voulez-vous vraiment supprimer toutes les réponses ISO ?')) {
      const token = localStorage.getItem('token');
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      this.http.delete('http://localhost:8088/api/response/history', { headers })
        .subscribe({
          next: () => {
            alert('Toutes les réponses ISO ont été supprimées');
            this.loadAllResponses();
          },
          error: () => alert('Erreur lors de la suppression de toutes les réponses ISO')
        });
    }
  }

  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }

  applyAdvancedFilter() {
    const { mti, status, startDate, endDate, keyword } = this.filterForm.value;
    this.dataSource.filterPredicate = (item, filter) => {
      const f = JSON.parse(filter);
      const matchesMti = !f.mti || (item.mti && item.mti.toLowerCase().includes(f.mti.toLowerCase()));
      const matchesStatus = !f.status || (item.status && item.status.toLowerCase().includes(f.status.toLowerCase()));
      const matchesKeyword = !f.keyword || Object.values(item).some(val => val && val.toString().toLowerCase().includes(f.keyword.toLowerCase()));
      const matchesStart = !f.startDate || (item.createdAt && new Date(item.createdAt) >= new Date(f.startDate));
      const matchesEnd = !f.endDate || (item.createdAt && new Date(item.createdAt) <= new Date(f.endDate));
      return matchesMti && matchesStatus && matchesKeyword && matchesStart && matchesEnd;
    };
    this.dataSource.filter = JSON.stringify(this.filterForm.value);
  }

  resetFilter() {
    this.filterForm.reset();
    this.dataSource.filter = '';
  }

  downloadPdf() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    this.http.get('http://localhost:8088/api/response/report/pdf', { headers, responseType: 'blob' })
      .subscribe(blob => {
        const dateStr = new Date().toISOString().slice(0,10);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iso_responses_${dateStr}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('PDF téléchargé avec succès !', 'Fermer', { duration: 3000 });
      });
  }

  downloadExcel() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    this.http.get('http://localhost:8088/api/response/report/excel', { headers, responseType: 'blob' })
      .subscribe(blob => {
        const dateStr = new Date().toISOString().slice(0,10);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iso_responses_${dateStr}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Excel téléchargé avec succès !', 'Fermer', { duration: 3000 });
      });
  }

  downloadCsv() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    this.http.get('http://localhost:8088/api/response/report/csv', { headers, responseType: 'blob' })
      .subscribe(blob => {
        const dateStr = new Date().toISOString().slice(0,10);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iso_responses_${dateStr}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('CSV téléchargé avec succès !', 'Fermer', { duration: 3000 });
      });
  }

  deleteResponse(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cette réponse ISO ?')) {
      const token = localStorage.getItem('token');
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      this.http.delete(`http://localhost:8088/api/response/${id}`, { headers })
        .subscribe({
          next: () => {
            this.snackBar.open('Réponse ISO supprimée avec succès !', 'Fermer', { duration: 3000 });
            this.loadAllResponses();
          },
          error: () => this.snackBar.open('Erreur lors de la suppression de la réponse ISO', 'Fermer', { duration: 3000 })
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
  deleteSelectedResponses() {
    const selectedIds = this.selection.selected.map(item => item.id);
    if (selectedIds.length === 0) {
      this.snackBar.open('Aucune ligne sélectionnée.', 'Fermer', { duration: 2000 });
      return;
    }
    if (confirm('Voulez-vous vraiment supprimer les réponses sélectionnées ?')) {
      const token = localStorage.getItem('token');
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      Promise.all(selectedIds.map(id =>
        this.http.delete(`http://localhost:8088/api/response/${id}`, { headers }).toPromise()
      )).then(() => {
        this.snackBar.open('Sélection supprimée avec succès !', 'Fermer', { duration: 3000 });
        this.loadAllResponses();
        this.selection.clear();
      }).catch(() => {
        this.snackBar.open('Erreur lors de la suppression.', 'Fermer', { duration: 3000 });
      });
    }
  }
} 