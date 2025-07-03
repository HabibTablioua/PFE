import { Component, ViewChild } from '@angular/core';
import { IncidentService } from '../../services/incident.service';
import { IncidentListComponent } from '../../components/incident-list/incident-list.component';
import { IncidentFormComponent } from '../../components/incident-form/incident-form.component';

@Component({
  selector: 'app-incidents-page',
  standalone: true,
  imports: [IncidentFormComponent, IncidentListComponent],
  templateUrl: './incidents.page.html',
  styleUrls: ['./incidents.page.css']
})
export class IncidentsPage {
  @ViewChild(IncidentListComponent) incidentList!: IncidentListComponent;
  @ViewChild(IncidentFormComponent) incidentForm!: IncidentFormComponent;

  constructor(private incidentService: IncidentService) {}

  onCreateIncident(data: any) {
    this.incidentService.create(data).subscribe({
      next: () => {
        this.incidentService.showSuccess('Incident créé avec succès');
        this.incidentList.loadIncidents();
        this.incidentForm.resetForm();
      },
      error: () => this.incidentService.showError('Erreur lors de la création')
    });
  }
} 