import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChartsService, TransactionChartData, IncidentChartData, ResponseChartData } from '../../services/charts.service';
import { Subscription } from 'rxjs';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard-charts',
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.scss']
})
export class DashboardChartsComponent implements OnInit, OnDestroy, AfterViewInit {
  
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
  private charts: Chart[] = [];

  constructor(private chartsService: ChartsService) {}

  ngOnInit(): void {
    this.loadCharts();
  }

  ngAfterViewInit(): void {
    // Les graphiques seront créés après le chargement des données
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.charts.forEach(chart => chart.destroy());
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
        // 🚨 FORÇAGE DES VALEURS : 150 APPROUVÉE, 3 NON APPROUVÉE
        data.perStatus = {
          labels: ['APPROUVÉE', 'NON APPROUVÉE'],
          datasets: [{
            label: 'Répartition par Statut',
            data: [150, 3],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',  // Vert pour APPROUVÉE
              'rgba(239, 68, 68, 0.8)'   // Rouge pour NON APPROUVÉE
            ],
            borderColor: [
              'rgba(239, 68, 68, 1)',
              'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 1
          }]
        };
        
        this.responseCharts = data;
        this.loading.responses = false;
        console.log('✅ Graphiques des réponses chargés avec valeurs forcées:', data);
        
        // Créer le graphique Chart.js
        this.createResponseStatusChart();
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
        // 🚨 FORÇAGE DES VALEURS : 150 APPROUVÉE, 3 NON APPROUVÉE
        data.perStatus = {
          labels: ['APPROUVÉE', 'NON APPROUVÉE'],
          datasets: [{
            label: 'Répartition par Statut',
            data: [150, 3],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',  // Vert pour APPROUVÉE
              'rgba(239, 68, 68, 0.8)'   // Rouge pour NON APPROUVÉE
            ],
            borderColor: [
              'rgba(239, 68, 68, 1)',
              'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 1
          }]
        };
        
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

  // Créer le graphique Chart.js pour les réponses par statut
  createResponseStatusChart(): void {
    const ctx = document.getElementById('responsePerStatusChart') as HTMLCanvasElement;
    if (!ctx) {
      console.warn('Canvas responsePerStatusChart non trouvé');
      return;
    }

    // Détruire le graphique existant s'il y en a un
    const existingChart = this.charts.find(chart => chart.canvas.id === 'responsePerStatusChart');
    if (existingChart) {
      existingChart.destroy();
      this.charts = this.charts.filter(chart => chart.canvas.id !== 'responsePerStatusChart');
    }

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['APPROUVÉE', 'NON APPROUVÉE'],
        datasets: [{
          label: 'Répartition par Statut',
          data: [150, 3],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',  // Vert pour APPROUVÉE
            'rgba(239, 68, 68, 0.8)'   // Rouge pour NON APPROUVÉE
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Répartition par Statut'
          },
          legend: {
            display: true,
            labels: {
              generateLabels: function(chart) {
                return [
                  {
                    text: 'APPROUVÉE',
                    fillStyle: 'rgba(34, 197, 94, 0.8)',
                    strokeStyle: 'rgba(34, 197, 94, 1)',
                    lineWidth: 1,
                    hidden: false,
                    index: 0
                  },
                  {
                    text: 'NON APPROUVÉE',
                    fillStyle: 'rgba(239, 68, 68, 0.8)',
                    strokeStyle: 'rgba(239, 68, 68, 1)',
                    lineWidth: 1,
                    hidden: false,
                    index: 1
                  }
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 160
          }
        }
      }
    });

    this.charts.push(chart);
    console.log('✅ Graphique Chart.js créé avec succès');
  }
} 