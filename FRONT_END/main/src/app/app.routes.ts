import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/message-form', // L'utilisateur normal commence par la génération de messages
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.routes),
        canActivate: [AdminGuard], // Seuls les admins peuvent accéder au dashboard
      },
      {
        path: 'message-form',
        loadComponent: () =>
          import('./pages/message-form/message-form.component').then((m) => m.MessageFormComponent),
      },
      {
        path: 'iso-depacker',
        loadComponent: () =>
          import('./pages/iso-depacker/iso-depacker.component').then(
            (m) => m.IsoDepackerComponent
          ),
      },
      {
        path: 'iso-response',
        loadComponent: () =>
          import('./pages/iso-response/iso-response.component').then(
            (m) => m.IsoResponseComponent
          ),
      },
      {
        path: 'transaction-history',
        loadComponent: () =>
          import('./pages/transaction-history/transaction-history.component').then(
            (m) => m.TransactionHistoryComponent
          ),
      },
      {
        path: 'transaction-map',
        loadComponent: () =>
          import('./components/transaction-map/transaction-map.component').then(
            (m) => m.TransactionMapComponent
          ),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./pages/logs-monitoring/logs-monitoring.component').then(
            (m) => m.LogsMonitoringComponent
          ),
        // Accessible à tous les utilisateurs authentifiés
      },
      {
        path: 'incidents',
        loadComponent: () =>
          import('./pages/incidents/incidents.page').then(
            (m) => m.IncidentsPage
          ),
        // Accessible à tous les utilisateurs authentifiés
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users.component').then(
            (m) => m.UsersComponent
          ),
        canActivate: [AdminGuard], // Seuls les admins peuvent gérer les utilisateurs
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./pages/accounts/account-list.component').then(
            (m) => m.AccountListComponent
          ),
        canActivate: [AdminGuard], // Seuls les admins peuvent gérer les comptes
      },
      {
        path: 'accounts/new',
        loadComponent: () =>
          import('./pages/accounts/account-form.component').then(
            (m) => m.AccountFormComponent
          ),
        canActivate: [AdminGuard], // Seuls les admins peuvent créer des comptes
      },
      {
        path: 'cards',
        loadComponent: () =>
          import('./pages/cards/card-list.component').then(
            (m) => m.CardListComponent
          ),
        canActivate: [AdminGuard], // Seuls les admins peuvent gérer les cartes
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];