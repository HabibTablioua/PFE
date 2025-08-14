import { Component, OnInit, ViewChild } from '@angular/core';
import { Incident } from '../../models/incident.model';
import { IncidentService } from '../../services/incident.service';
import { MatDialog } from '@angular/material/dialog';
import { IncidentEditDialogComponent } from '../incident-edit-dialog/incident-edit-dialog.component';
import { IncidentDeleteDialogComponent } from '../incident-delete-dialog/incident-delete-dialog.component';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatDialogModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: './incident-list.component.html',
  styleUrls: ['./incident-list.component.css']
})
export class IncidentListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'description', 'status', 'dateTime', 'actions'];
  dataSource = new MatTableDataSource<Incident>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  showFilterPanel = false;
  filterForm: FormGroup;
  isAdmin = false;

  constructor(
    private incidentService: IncidentService, 
    private dialog: MatDialog, 
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      title: [''],
      client: [''],
      description: ['']
    });
  }

  ngOnInit() {
    // Vérifier le rôle de l'utilisateur
    this.isAdmin = this.authService.isAdmin();
    
    // Afficher la colonne utilisateur pour tous (admin et utilisateurs normaux)
    this.displayedColumns = ['id', 'title', 'description', 'status', 'dateTime', 'user', 'actions'];
    
    this.loadIncidents();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadIncidents() {
    // Utiliser la nouvelle logique par rôle
    this.incidentService.getIncidentsByRole().subscribe({
      next: data => {
        // Trier par dateTime décroissante (plus récent en premier)
        this.dataSource.data = data.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        this.dataSource.paginator = this.paginator;
      },
      error: () => this.incidentService.showError('Erreur lors du chargement des incidents')
    });
  }

  onEdit(incident: Incident) {
    const dialogRef = this.dialog.open(IncidentEditDialogComponent, {
      width: '500px',
      data: { incident }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.incidentService.update(incident.id, result).subscribe({
          next: () => {
            this.incidentService.showSuccess('Incident modifié avec succès');
            this.loadIncidents();
          },
          error: () => this.incidentService.showError('Erreur lors de la modification')
        });
      }
    });
  }

  onDelete(incident: Incident) {
    const dialogRef = this.dialog.open(IncidentDeleteDialogComponent, {
      width: '350px'
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.incidentService.delete(incident.id).subscribe({
          next: () => {
            this.incidentService.showSuccess('Incident supprimé');
            this.loadIncidents();
          },
          error: () => this.incidentService.showError('Erreur lors de la suppression')
        });
      }
    });
  }

  onDeleteAll() {
    const dialogRef = this.dialog.open(IncidentDeleteDialogComponent, {
      width: '350px',
      data: { isBulk: true }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.incidentService.deleteAll().subscribe({
          next: () => {
            this.incidentService.showSuccess('Tous les incidents ont été supprimés');
            this.loadIncidents();
          },
          error: () => this.incidentService.showError('Erreur lors de la suppression de tous les incidents')
        });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }

  applyAdvancedFilter() {
    const { startDate, endDate, title, client, description } = this.filterForm.value;
    this.dataSource.filterPredicate = (incident: Incident, filter: string) => {
      const f = JSON.parse(filter);
      const matchesDate = (!f.startDate || new Date(incident.dateTime) >= new Date(f.startDate)) &&
                         (!f.endDate || new Date(incident.dateTime) <= new Date(f.endDate));
      const matchesTitle = !f.title || (incident.title && incident.title.toLowerCase().includes(f.title.toLowerCase()));
      const matchesClient = !f.client || (incident.username && incident.username.toLowerCase().includes(f.client.toLowerCase()));
      const matchesDesc = !f.description || (incident.description && incident.description.toLowerCase().includes(f.description.toLowerCase()));
      return !!(matchesDate && matchesTitle && matchesClient && matchesDesc);
    };
    this.dataSource.filter = JSON.stringify(this.filterForm.value);
  }

  resetFilter() {
    this.filterForm.reset();
    this.dataSource.filter = '';
  }
}