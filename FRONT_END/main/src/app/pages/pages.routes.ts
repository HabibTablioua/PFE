import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts',
    loadComponent: () => import('./accounts/account-list.component').then(m => m.AccountListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'accounts/create',
    loadComponent: () => import('./accounts/account-form.component').then(m => m.AccountFormComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'cards',
    loadComponent: () => import('./cards/card-list.component').then(m => m.CardListComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'incidents',
    loadComponent: () => import('./incidents/incidents.page').then(m => m.IncidentsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'iso-depacker',
    loadComponent: () => import('./iso-depacker/iso-depacker.component').then(m => m.IsoDepackerComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'iso-response',
    loadComponent: () => import('./iso-response/iso-response.component').then(m => m.IsoResponseComponent),
    canActivate: [AuthGuard]
  },

  {
    path: 'logs-monitoring',
    loadComponent: () => import('./logs-monitoring/logs-monitoring.component').then(m => m.LogsMonitoringComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'transaction-history',
    loadComponent: () => import('./transaction-history/transaction-history.component').then(m => m.TransactionHistoryComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'message-form',
    loadComponent: () => import('./message-form/message-form.component').then(m => m.MessageFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'starter',
    loadComponent: () => import('./starter/starter.component').then(m => m.StarterComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
    canActivate: [AuthGuard, AdminGuard]
  }
];
