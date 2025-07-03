import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { LogsMonitoringComponent } from './logs-monitoring/logs-monitoring.component';
import { AuthGuard } from '../guards/auth.guard';
import { IncidentsPage } from './incidents/incidents.page';

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
  // La route 'message' a été supprimée car le composant iso-form n'existe plus
];
