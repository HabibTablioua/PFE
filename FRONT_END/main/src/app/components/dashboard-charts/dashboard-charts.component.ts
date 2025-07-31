import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartsService, TransactionChartData, IncidentChartData, ResponseChartData } from '../../services/charts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-charts',
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.scss']
})
export class DashboardChartsComponent implements OnInit, OnDestroy {
  
  // Données des graphiques
  transactionCharts: TransactionChartData | null = null;
  incidentCharts: IncidentChartData | null = null;
  responseCharts: ResponseChartData | null = null;
  
  // États de chargement
  loading = {
    transactions: false,
    incidents: false,
    responses: false
  };
  
  // Erreurs
  errors = {
    transactions: false,
    incidents: false,
    responses: false
  };
  
  private subscriptions: Subscription[] = [];

  constructor(private chartsService: ChartsService) {}

  ngOnInit(): void {
    this.loadCharts();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCharts(): void {
    // Charger les graphiques des transactions
    this.loading.transactions = true;
    this.errors.transactions = false;
    
    const transactionSub = this.chartsService.getTransactionCharts().subscribe({
      next: (data) => {
        this.transactionCharts = data;
        this.loading.transactions = false;
        console.log('✅ Graphiques des transactions chargés:', data);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des graphiques des transactions:', error);
        this.errors.transactions = true;
        this.loading.transactions = false;
      }
    });

    // Charger les graphiques des incidents
    this.loading.incidents = true;
    this.errors.incidents = false;
    
    const incidentSub = this.chartsService.getIncidentCharts().subscribe({
      next: (data) => {
        this.incidentCharts = data;
        this.loading.incidents = false;
        console.log('✅ Graphiques des incidents chargés:', data);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des graphiques des incidents:', error);
        this.errors.incidents = true;
        this.loading.incidents = false;
      }
    });

    // Charger les graphiques des réponses
    this.loading.responses = true;
    this.errors.responses = false;
    
    const responseSub = this.chartsService.getResponseCharts().subscribe({
      next: (data) => {
        this.responseCharts = data;
        this.loading.responses = false;
        console.log('✅ Graphiques des réponses chargés:', data);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des graphiques des réponses:', error);
        this.errors.responses = true;
        this.loading.responses = false;
      }
    });

    this.subscriptions.push(transactionSub, incidentSub, responseSub);
  }

  // Méthodes pour rafraîchir les graphiques
  refreshTransactionCharts(): void {
    this.loading.transactions = true;
    this.errors.transactions = false;
    
    const sub = this.chartsService.getTransactionCharts().subscribe({
      next: (data) => {
        this.transactionCharts = data;
        this.loading.transactions = false;
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement des graphiques des transactions:', error);
        this.errors.transactions = true;
        this.loading.transactions = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  refreshIncidentCharts(): void {
    this.loading.incidents = true;
    this.errors.incidents = false;
    
    const sub = this.chartsService.getIncidentCharts().subscribe({
      next: (data) => {
        this.incidentCharts = data;
        this.loading.incidents = false;
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement des graphiques des incidents:', error);
        this.errors.incidents = true;
        this.loading.incidents = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  refreshResponseCharts(): void {
    this.loading.responses = true;
    this.errors.responses = false;
    
    const sub = this.chartsService.getResponseCharts().subscribe({
      next: (data) => {
        this.responseCharts = data;
        this.loading.responses = false;
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement des graphiques des réponses:', error);
        this.errors.responses = true;
        this.loading.responses = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  // Méthodes utilitaires
  isLoading(): boolean {
    return this.loading.transactions || this.loading.incidents || this.loading.responses;
  }

  hasErrors(): boolean {
    return this.errors.transactions || this.errors.incidents || this.errors.responses;
  }

  getErrorMessage(): string {
    const errors = [];
    if (this.errors.transactions) errors.push('Transactions');
    if (this.errors.incidents) errors.push('Incidents');
    if (this.errors.responses) errors.push('Réponses');
    
    return `Erreur lors du chargement des graphiques: ${errors.join(', ')}`;
  }
} 