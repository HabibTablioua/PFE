import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { LogsMonitoringComponent } from './logs-monitoring/logs-monitoring.component';
import { AuthGuard } from '../guards/auth.guard';
import { IncidentsPage } from './incidents/incidents.page';
import { IsoResponseComponent } from './iso-response/iso-response.component';
import { ProfileComponent } from './profile/profile.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter Page',
      urls: [
        { title: 'Dashboard', url: '/dashboards/dashboard1' },
        { title: 'Starter Page' },
      ],
    },
  },
  {
    path: 'logs-monitoring',
    component: LogsMonitoringComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Monitoring des Logs',
    },
  },
  {
    path: 'incidents',
    component: IncidentsPage,
    canActivate: [AuthGuard],
    data: {
      title: 'Gestion des Incidents',
    },
  },
  {
    path: 'iso-response',
    component: IsoResponseComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Réponse ISO',
    },
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Mon Profil',
    },
  },
  // La route 'message' a été supprimée car le composant iso-form n'existe plus
];
