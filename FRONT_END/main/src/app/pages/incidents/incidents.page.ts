import { Component, ViewChild, OnInit } from '@angular/core';
import { IncidentService } from '../../services/incident.service';
import { IncidentListComponent } from '../../components/incident-list/incident-list.component';
import { IncidentFormComponent } from '../../components/incident-form/incident-form.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-incidents-page',
  standalone: true,
  imports: [IncidentFormComponent, IncidentListComponent],
  templateUrl: './incidents.page.html',
  styleUrls: ['./incidents.page.css']
})
export class IncidentsPage implements OnInit {
  @ViewChild(IncidentListComponent) incidentList!: IncidentListComponent;
  @ViewChild(IncidentFormComponent) incidentForm!: IncidentFormComponent;
  
  isAdmin = false;
  currentUserId: number | undefined;

  constructor(
    private incidentService: IncidentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Vérifier le rôle de l'utilisateur
    this.isAdmin = this.authService.isAdmin();
    
    // Récupérer l'ID de l'utilisateur courant
    const currentUser = this.authService.getCurrentUserValue();
    this.currentUserId = currentUser?.id;
  }

  onCreateIncident(data: any) {
    // Ajouter l'ID de l'utilisateur à l'incident si ce n'est pas un admin
    if (!this.isAdmin && this.currentUserId) {
      data.userId = this.currentUserId;
    }

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
