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

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatDialogModule, MatPaginatorModule],
  providers: [DatePipe],
  templateUrl: './incident-list.component.html',
  styleUrls: ['./incident-list.component.css']
})
export class IncidentListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'description', 'dateTime', 'actions'];
  dataSource = new MatTableDataSource<Incident>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private incidentService: IncidentService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadIncidents();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadIncidents() {
    this.incidentService.getAll().subscribe({
      next: data => {
        this.dataSource.data = data;
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
} 