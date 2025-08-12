import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { Router } from '@angular/router';
import { DashboardStatsService, DashboardStats } from '../../services/dashboard-stats.service';
import { DashboardStateService, AlertData } from '../../services/dashboard-state.service';
import { TransactionStatsService, TransactionSourceStats, TransactionStatusStats } from '../../services/transaction-stats.service';
import { MetricWidgetComponent, MetricWidgetData } from '../../components/widgets/metric-widget.component';
import { AlertWidgetComponent } from '../../components/widgets/alert-widget.component';
import { LiveMetricsWidgetComponent } from '../../components/widgets/live-metrics-widget.component';
import { Subscription } from 'rxjs';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, MaterialModule, MetricWidgetComponent, AlertWidgetComponent, LiveMetricsWidgetComponent],
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }



    .metrics-section {
      margin-bottom: 32px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .alerts-section {
      margin-bottom: 32px;
    }

    .live-metrics-section {
      margin-bottom: 32px;
    }

    .stat-card {
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      color: white;
    }

    /* Bloc Transactions - Bleu */
    .stat-card.blue {
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      box-shadow: 0 8px 25px -5px rgba(6, 182, 212, 0.2);
    }

    /* Bloc Incidents - Rouge */
    .stat-card.red {
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      box-shadow: 0 8px 25px -5px rgba(244, 63, 94, 0.2);
    }

    /* Bloc Réponses ISO - Vert */
    .stat-card.green {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      box-shadow: 0 8px 25px -5px rgba(34, 197, 94, 0.2);
    }

    /* Bloc Comptes - Orange */
    .stat-card.orange {
      background: linear-gradient(135deg, #f97316, #ea580c);
      box-shadow: 0 8px 25px -5px rgba(249, 115, 22, 0.2);
    }

    /* Bloc Comptes Bancaires - Violet */
    .stat-card.purple {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      box-shadow: 0 8px 25px -5px rgba(139, 92, 246, 0.2);
    }

    /* Bloc Cartes Bancaires - Teal */
    .stat-card.teal {
      background: linear-gradient(135deg, #14b8a6, #0d9488);
      box-shadow: 0 8px 25px -5px rgba(20, 184, 166, 0.2);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25);
    }

    /* Effet de survol pour les icônes */
    .stat-card:hover .stat-icon {
      transform: scale(1.05);
      background: rgba(255, 255, 255, 0.3);
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .stat-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .stat-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }



    .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      margin-bottom: 8px;
      line-height: 1;
    }

    .stat-change {
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }

    .stat-change mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .stat-change.positive {
      color: rgba(255, 255, 255, 0.95);
      font-weight: 600;
    }

    .stat-change.negative {
      color: rgba(255, 255, 255, 0.95);
      font-weight: 600;
    }

    .stat-change.error {
      color: rgba(255, 255, 255, 0.95);
      font-weight: 600;
    }

    .stat-change.neutral {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }

    .stat-description {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 8px;
    }

    .charts-section {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 32px;
    }

    .charts-grid {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 24px;
      width: 100%;
    }

    .chart-card {
      flex: 1;
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .chart-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }

    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
    }

    .chart-container canvas {
      width: 100% !important;
      height: 100% !important;
    }

    .recent-activity {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .activity-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.875rem;
    }

    .activity-content {
      flex: 1;
    }

    .activity-text {
      font-size: 0.875rem;
      color: #374151;
      margin-bottom: 2px;
    }

    .activity-time {
      font-size: 0.75rem;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .charts-section {
        flex-direction: column;
      }
      
      .charts-grid {
        flex-direction: column;
      }
      
      .chart-card {
        flex: none;
      }
      
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // États
  loading = true;
  error = false;
  
  // Données des statistiques
  stats: any[] = [];
  metricsData: MetricWidgetData[] = [];
  alerts: AlertData[] = [];
  
  // Données des graphiques
  transactionCharts: any = null;
  incidentCharts: any = null;
  responseCharts: any = null;
  
  // Nouveaux graphiques de statistiques
  sourceCharts: any = null;
  statusCharts: any = null;
  
  // Données des statistiques de transactions
  sourceStats: TransactionSourceStats[] = [];
  statusStats: TransactionStatusStats[] = [];
  
  // Graphiques Chart.js
  charts: Chart[] = [];
  
  // Activités récentes
  recentActivities = [
    {
      text: 'Nouvelle transaction traitée',
      time: 'Il y a 2 minutes',
      icon: 'payment',
      iconClass: 'blue'
    },
    {
      text: 'Incident résolu',
      time: 'Il y a 5 minutes',
      icon: 'check_circle',
      iconClass: 'green'
    },
    {
      text: 'Nouveau compte créé',
      time: 'Il y a 10 minutes',
      icon: 'person_add',
      iconClass: 'orange'
    }
  ];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private dashboardStatsService: DashboardStatsService,
    private dashboardStateService: DashboardStateService,
    private transactionStatsService: TransactionStatsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    // Les graphiques seront créés après le chargement des données
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Détruire les graphiques
    this.charts.forEach(chart => chart.destroy());
  }

  loadStats(): void {
    this.loading = true;
    this.error = false;
    
    console.log('🔄 Chargement des statistiques du dashboard...');
    
    // Utiliser le service d'état
    this.dashboardStateService.setLoading(true);
    
    const sub = this.dashboardStatsService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('✅ Données reçues:', data);
        
        // Mettre à jour l'état global
        this.dashboardStateService.setStats(data);
        
        // Mettre à jour les métriques
        this.dashboardStateService.getMetricsData().subscribe(metrics => {
          this.metricsData = metrics;
        });
        
        // Mettre à jour les alertes
        this.alerts = this.dashboardStateService.getMockAlerts();
        
        this.stats = [
          {
            title: 'Total Transactions',
            value: data.totalTransactions || 0,
            change: '+12%',
            changeType: 'positive',
            icon: 'payment',
            iconClass: 'blue',
            description: 'Transactions aujourd\'hui'
          },
          {
            title: 'Total Comptes',
            value: data.totalUsers || 0,
            change: `${data.connectedUsers || 0} connectés`,
            changeType: 'neutral',
            icon: 'people',
            iconClass: 'green',
            description: 'Utilisateurs actifs'
          },
          {
            title: 'Incidents Ouverts',
            value: data.openIncidents || 0,
            change: '-5%',
            changeType: 'negative',
            icon: 'warning',
            iconClass: 'red',
            description: 'En cours de traitement'
          },
          {
            title: 'Taux de Succès',
            value: `${data.successRate || 0}%`,
            change: '+2%',
            changeType: 'positive',
            icon: 'check_circle',
            iconClass: 'orange',
            description: 'Réponses réussies'
          },
          {
            title: 'Comptes Bancaires',
            value: data.bankAccounts || 0,
            change: '+3%',
            changeType: 'positive',
            icon: 'account_balance',
            iconClass: 'purple',
            description: 'Comptes actifs'
          },
          {
            title: 'Cartes Bancaires',
            value: data.cards || 0,
            change: '+8%',
            changeType: 'positive',
            icon: 'credit_card',
            iconClass: 'teal',
            description: 'Cartes en circulation'
          }
        ];
        
        this.loading = false;
        
        // Charger les statistiques de transactions
        this.loadTransactionStats();
        
        this.createCharts();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des statistiques:', error);
        this.error = true;
        this.loading = false;
        
        // Statistiques par défaut en cas d'erreur
        this.stats = [
          {
            title: 'Total Transactions',
            value: 0,
            change: 'N/A',
            changeType: 'error',
            icon: 'payment',
            iconClass: 'blue',
            description: 'Service indisponible'
          },
          {
            title: 'Total Comptes',
            value: 0,
            change: 'N/A',
            changeType: 'error',
            icon: 'people',
            iconClass: 'green',
            description: 'Service indisponible'
          },
          {
            title: 'Incidents Ouverts',
            value: 0,
            change: 'N/A',
            changeType: 'error',
            icon: 'warning',
            iconClass: 'red',
            description: 'Service indisponible'
          },
          {
            title: 'Taux de Succès',
            value: '0%',
            change: 'N/A',
            changeType: 'error',
            icon: 'check_circle',
            iconClass: 'orange',
            description: 'Service indisponible'
          },
          {
            title: 'Comptes Bancaires',
            value: 0,
            change: 'N/A',
            changeType: 'error',
            icon: 'account_balance',
            iconClass: 'purple',
            description: 'Service indisponible'
          },
          {
            title: 'Cartes Bancaires',
            value: 0,
            change: 'N/A',
            changeType: 'error',
            icon: 'credit_card',
            iconClass: 'teal',
            description: 'Service indisponible'
          }
        ];
      }
    });
    
    this.subscriptions.push(sub);
  }

  createCharts(): void {
    // Attendre que le DOM soit prêt
    setTimeout(() => {
      this.createTransactionChart();
      this.createIncidentChart();
      // Supprimé: this.createResponseChart();
    }, 100);
  }

  createTransactionChart(): void {
    const ctx = document.getElementById('transactionChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [{
          label: 'Transactions',
          data: [65, 59, 80, 81, 56, 55, 40],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Évolution des Transactions'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    this.charts.push(chart);
  }

  createIncidentChart(): void {
    const ctx = document.getElementById('incidentChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Résolus', 'En cours', 'Non traités'],
        datasets: [{
          data: [70, 20, 10],
          backgroundColor: [
            '#22c55e',
            '#f59e0b',
            '#ef4444'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Répartition des Incidents'
          }
        }
      }
    });

    this.charts.push(chart);
  }

  createResponseChart(): void {
    const ctx = document.getElementById('responseChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Succès', 'Échec', 'En cours'],
        datasets: [{
          label: 'Réponses',
          data: [85, 10, 5],
          backgroundColor: [
            '#22c55e',
            '#ef4444',
            '#f59e0b'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Statut des Réponses'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    this.charts.push(chart);
  }

  // Navigation
  navigateToAccounts(): void {
    this.router.navigate(['/accounts']);
  }

  navigateToTransactions(): void {
    this.router.navigate(['/transactions']);
  }

  navigateToIncidents(): void {
    this.router.navigate(['/dashboard/incidents']);
  }

  // Widget event handlers
  onMetricWidgetClick(metric: MetricWidgetData): void {
    console.log('Metric widget clicked:', metric);
    
    // Navigation basée sur le type de métrique
    switch (metric.title) {
      case 'Comptes Bancaires':
        this.router.navigate(['/accounts']);
        break;
      case 'Cartes Bancaires':
        this.router.navigate(['/cards']);
        break;
      case 'Incidents Ouverts':
        this.router.navigate(['/incidents']);
        break;
      case 'Total Transactions':
        this.router.navigate(['/transaction-history']);
        break;
      case 'Taux de Succès':
        this.router.navigate(['/iso-response']);
        break;
      default:
        console.log('Aucune navigation définie pour:', metric.title);
    }
  }

  onAlertClick(alert: AlertData): void {
    console.log('Alert clicked:', alert);
    // Ici vous pouvez ajouter la logique pour afficher les détails de l'alerte
  }

  onAlertActionClick(alert: AlertData): void {
    console.log('Alert action clicked:', alert);
    // Ici vous pouvez ajouter la logique pour l'action de l'alerte
  }

  onRefreshAlerts(): void {
    console.log('Refreshing alerts...');
    // Ici vous pouvez ajouter la logique pour rafraîchir les alertes
  }

  // Charger les statistiques de transactions
  loadTransactionStats(): void {
    console.log('🔄 Chargement des statistiques de transactions...');
    
    // Charger les statistiques par source
    const sourceSub = this.transactionStatsService.getTransactionSourcesStats().subscribe({
      next: (data) => {
        console.log('✅ Statistiques par source reçues:', data);
        this.sourceStats = data;
        this.createSourceChart();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des statistiques par source:', error);
        // Données par défaut en cas d'erreur
        this.sourceStats = [
          { source: 'ATM', count: 45, percentage: 35 },
          { source: 'POS', count: 30, percentage: 23 },
          { source: 'Online', count: 25, percentage: 19 },
          { source: 'Mobile', count: 20, percentage: 15 },
          { source: 'Call Center', count: 10, percentage: 8 }
        ];
        this.createSourceChart();
      }
    });

    // Charger les statistiques par statut
    const statusSub = this.transactionStatsService.getTransactionStatusStats().subscribe({
      next: (data) => {
        console.log('✅ Statistiques par statut reçues:', data);
        this.statusStats = data;
        this.createStatusChart();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des statistiques par statut:', error);
        // Données par défaut en cas d'erreur
        this.statusStats = [
          { status: 'SUCCESS', count: 85, percentage: 85 },
          { status: 'ERROR', count: 10, percentage: 10 },
          { status: 'PENDING', count: 5, percentage: 5 }
        ];
        this.createStatusChart();
      }
    });

    this.subscriptions.push(sourceSub, statusSub);
  }

  // Créer le graphique des sources de transactions
  createSourceChart(): void {
    const ctx = document.getElementById('sourceChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Détruire le graphique existant s'il y en a un
    if (this.sourceCharts) {
      this.sourceCharts.destroy();
    }

    const labels = this.sourceStats.map(stat => stat.source);
    const data = this.sourceStats.map(stat => stat.count);
    const colors = [
      '#3b82f6', // Bleu
      '#10b981', // Vert
      '#f59e0b', // Orange
      '#ef4444', // Rouge
      '#8b5cf6'  // Violet
    ];

    this.sourceCharts = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                return `${label}: ${value}`;
              }
            }
          }
        }
      }
    });

    this.charts.push(this.sourceCharts);
  }

  // Créer le graphique des statuts de transactions
  createStatusChart(): void {
    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Détruire le graphique existant s'il y en a un
    if (this.statusCharts) {
      this.statusCharts.destroy();
    }

    const labels = this.statusStats.map(stat => stat.status);
    const data = this.statusStats.map(stat => stat.count);
    const colors = [
      '#22c55e', // Vert pour SUCCESS
      '#ef4444', // Rouge pour ERROR
      '#f59e0b'  // Orange pour PENDING
    ];

    this.statusCharts = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de Transactions',
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(color => color + '80'),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                return `${context.dataset.label}: ${value}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });

    this.charts.push(this.statusCharts);
  }
} 