import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface DashboardStats {
  totalTransactions: number;
  totalUsers: number;
  openIncidents: number;
  successRate: number;
  bankAccounts: number;
  cards: number;
  connectedUsers?: number;
}

export interface AlertData {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description: string;
  time: string;
  icon?: string;
  action?: string;
}

export interface DashboardState {
  loading: boolean;
  error: string | null;
  stats: DashboardStats | null;
  alerts: AlertData[];
  lastUpdated: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private state$ = new BehaviorSubject<DashboardState>({
    loading: false,
    error: null,
    stats: null,
    alerts: [],
    lastUpdated: null
  });

  // Observables publics
  public readonly dashboardState$ = this.state$.asObservable();
  public readonly loading$ = this.state$.pipe(
    map(state => state.loading),
    distinctUntilChanged()
  );
  public readonly error$ = this.state$.pipe(
    map(state => state.error),
    distinctUntilChanged()
  );
  public readonly stats$ = this.state$.pipe(
    map(state => state.stats),
    distinctUntilChanged()
  );
  public readonly alerts$ = this.state$.pipe(
    map(state => state.alerts),
    distinctUntilChanged()
  );
  public readonly lastUpdated$ = this.state$.pipe(
    map(state => state.lastUpdated),
    distinctUntilChanged()
  );

  // Méthodes pour mettre à jour l'état
  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | null): void {
    this.updateState({ error, loading: false });
  }

  setStats(stats: DashboardStats): void {
    this.updateState({ 
      stats, 
      loading: false, 
      error: null,
      lastUpdated: new Date()
    });
  }

  setAlerts(alerts: AlertData[]): void {
    this.updateState({ alerts });
  }

  addAlert(alert: AlertData): void {
    const currentAlerts = this.state$.value.alerts;
    this.updateState({ 
      alerts: [alert, ...currentAlerts]
    });
  }

  removeAlert(alertId: string): void {
    const currentAlerts = this.state$.value.alerts;
    this.updateState({ 
      alerts: currentAlerts.filter(alert => alert.id !== alertId)
    });
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  // Méthodes utilitaires
  getState(): DashboardState {
    return this.state$.value;
  }

  isLoaded(): boolean {
    const state = this.state$.value;
    return !state.loading && !state.error && state.stats !== null;
  }

  // Méthode privée pour mettre à jour l'état
  private updateState(partial: Partial<DashboardState>): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, ...partial });
  }

  // Méthodes pour les métriques calculées
  getMetricsData(): Observable<any[]> {
    return this.stats$.pipe(
      map(stats => {
        if (!stats) return [];
        
        return [
          {
            title: 'Total Transactions',
            value: stats.totalTransactions,
            change: '+12%',
            changeType: 'positive' as const,
            icon: 'payment',
            colorClass: 'blue',
            description: 'Transactions aujourd\'hui'
          },
          {
            title: 'Total Comptes',
            value: stats.totalUsers,
            change: `${stats.connectedUsers || 0} connectés`,
            changeType: 'neutral' as const,
            icon: 'people',
            colorClass: 'green',
            description: 'Utilisateurs actifs'
          },
          {
            title: 'Incidents Ouverts',
            value: stats.openIncidents,
            change: '-5%',
            changeType: 'negative' as const,
            icon: 'warning',
            colorClass: 'red',
            description: 'En cours de traitement'
          },
          {
            title: 'Taux de Succès',
            value: `${stats.successRate}%`,
            change: '+2%',
            changeType: 'positive' as const,
            icon: 'check_circle',
            colorClass: 'orange',
            description: 'Réponses réussies'
          },
          {
            title: 'Comptes Bancaires',
            value: stats.bankAccounts,
            change: '+3%',
            changeType: 'positive' as const,
            icon: 'account_balance',
            colorClass: 'purple',
            description: 'Comptes actifs'
          },
          {
            title: 'Cartes Bancaires',
            value: stats.cards,
            change: '+8%',
            changeType: 'positive' as const,
            icon: 'credit_card',
            colorClass: 'teal',
            description: 'Cartes en circulation'
          }
        ];
      })
    );
  }

  // Méthodes pour les alertes simulées
  getMockAlerts(): AlertData[] {
    return [
      {
        id: '1',
        type: 'warning',
        title: 'Temps de réponse élevé',
        description: 'Serveur principal - 5.2s (seuil: 3s)',
        time: 'Il y a 3 minutes',
        icon: 'speed',
        action: 'Voir détails'
      },
      {
        id: '2',
        type: 'info',
        title: 'Maintenance planifiée',
        description: 'Mise à jour système prévue à 02:00',
        time: 'Dans 4 heures',
        icon: 'schedule',
        action: 'Détails'
      },
      {
        id: '3',
        type: 'success',
        title: 'Sauvegarde terminée',
        description: 'Sauvegarde automatique réussie',
        time: 'Il y a 15 minutes',
        icon: 'backup'
      }
    ];
  }
} 