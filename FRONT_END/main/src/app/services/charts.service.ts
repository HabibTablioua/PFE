import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { buildServiceUrl } from '../config/services.config';

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface TransactionChartData {
  perDay: ChartData;
  perStatus: ChartData;
  perSource: ChartData;
  perMonth: ChartData;
  perHour: ChartData;
}

export interface IncidentChartData {
  perStatus: ChartData;
  perMonth: ChartData;
  perPriority: ChartData;
}

export interface ResponseChartData {
  perStatus: ChartData;
  perMonth: ChartData;
  successRate: ChartData;
}

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // Graphiques des transactions
  getTransactionCharts(): Observable<TransactionChartData> {
    const headers = this.getAuthHeaders();
    
    return forkJoin({
      perDay: this.http.get<any[]>(buildServiceUrl('TRANSACTION_SERVICE', 'PER_DAY'), { headers }),
      perStatus: this.http.get<any[]>(buildServiceUrl('TRANSACTION_SERVICE', 'PER_STATUS'), { headers }),
      perSource: this.http.get<any[]>(buildServiceUrl('TRANSACTION_SERVICE', 'PER_SOURCE'), { headers })
    }).pipe(
      map(results => {
        return {
          perDay: this.transformToChartData(results.perDay, 'Transactions par Jour', 'rgba(59, 130, 246, 0.8)'),
          perStatus: this.transformToChartData(results.perStatus, 'Transactions par Statut', [
            'rgba(34, 197, 94, 0.8)',  // Vert pour succès
            'rgba(239, 68, 68, 0.8)',  // Rouge pour échec
            'rgba(245, 158, 11, 0.8)'  // Orange pour en attente
          ]),
          perSource: this.transformToChartData(results.perSource, 'Transactions par Source', 'rgba(139, 92, 246, 0.8)'),
          perMonth: this.generateMonthlyData(results.perDay),
          perHour: this.generateHourlyData(results.perDay)
        };
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des graphiques de transactions:', error);
        return of(this.getDefaultTransactionCharts());
      })
    );
  }

  // Graphiques des incidents
  getIncidentCharts(): Observable<IncidentChartData> {
    const headers = this.getAuthHeaders();
    
    return forkJoin({
      perStatus: this.http.get<any[]>(buildServiceUrl('INCIDENT_SERVICE', 'PER_STATUS'), { headers }).pipe(catchError(() => of([]))),
      perMonth: this.http.get<any[]>(buildServiceUrl('INCIDENT_SERVICE', 'PER_MONTH'), { headers }).pipe(catchError(() => of([]))),
      perPriority: this.http.get<any[]>(buildServiceUrl('INCIDENT_SERVICE', 'PER_PRIORITY'), { headers }).pipe(catchError(() => of([])))
    }).pipe(
      map(results => {
        return {
          perStatus: this.transformToChartData(results.perStatus, 'Incidents par Statut', [
            'rgba(239, 68, 68, 0.8)',  // Rouge pour non traité
            'rgba(34, 197, 94, 0.8)',  // Vert pour résolu
            'rgba(245, 158, 11, 0.8)'  // Orange pour en cours
          ]),
          perMonth: this.generateMonthlyData(results.perMonth),
          perPriority: this.transformToChartData(results.perPriority, 'Incidents par Priorité', [
            'rgba(239, 68, 68, 0.8)',  // Rouge pour haute
            'rgba(245, 158, 11, 0.8)', // Orange pour moyenne
            'rgba(34, 197, 94, 0.8)'   // Vert pour basse
          ])
        };
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des graphiques d\'incidents:', error);
        return of(this.getDefaultIncidentCharts());
      })
    );
  }

  // Graphiques des réponses ISO
  getResponseCharts(): Observable<ResponseChartData> {
    const headers = this.getAuthHeaders();
    
    return forkJoin({
      perStatus: this.http.get<any[]>(buildServiceUrl('RESPONSE_SERVICE', 'PER_STATUS'), { headers }).pipe(catchError(() => of([]))),
      perMonth: this.http.get<any[]>(buildServiceUrl('RESPONSE_SERVICE', 'PER_MONTH'), { headers }).pipe(catchError(() => of([]))),
      successRate: this.http.get<any[]>(buildServiceUrl('RESPONSE_SERVICE', 'SUCCESS_RATE'), { headers }).pipe(catchError(() => of([])))
    }).pipe(
      map(results => {
        return {
                     perStatus: {
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
           },
          perMonth: this.generateMonthlyData(results.perMonth),
          successRate: this.transformToChartData([{value: 60, label: 'Taux de Succès'}], 'Taux de Succès', 'rgba(34, 197, 94, 0.8)') // Taux fixé à 60%
        };
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des graphiques de réponses:', error);
        return of(this.getDefaultResponseCharts());
      })
    );
  }

  // Transformation des données en format Chart.js
  private transformToChartData(data: any[], label: string, backgroundColor: string | string[]): ChartData {
    if (!data || data.length === 0) {
      return {
        labels: ['Aucune donnée'],
        datasets: [{
          label: label,
          data: [0],
          backgroundColor: backgroundColor,
          borderColor: backgroundColor,
          borderWidth: 1
        }]
      };
    }

    const labels = data.map(item => item.label || item.name || item.date || 'Inconnu');
    const values = data.map(item => item.count || item.value || 0);

    return {
      labels: labels,
      datasets: [{
        label: label,
        data: values,
        backgroundColor: backgroundColor,
        borderColor: backgroundColor,
        borderWidth: 1,
        fill: false
      }]
    };
  }

  // Génération de données mensuelles
  private generateMonthlyData(data: any[]): ChartData {
    if (!data || data.length === 0) {
      return {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Données mensuelles',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          fill: true
        }]
      };
    }

    // Logique pour agréger les données par mois
    const monthlyData = new Array(12).fill(0);
    const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    data.forEach(item => {
      const date = new Date(item.date || item.createdAt);
      const month = date.getMonth();
      monthlyData[month] += item.count || item.value || 0;
    });

    return {
      labels: monthLabels,
      datasets: [{
        label: 'Données mensuelles',
        data: monthlyData,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  // Génération de données horaires
  private generateHourlyData(data: any[]): ChartData {
    const hourlyLabels = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    const hourlyData = new Array(24).fill(0);

    if (data && data.length > 0) {
      data.forEach(item => {
        const date = new Date(item.date || item.createdAt);
        const hour = date.getHours();
        hourlyData[hour] += item.count || item.value || 0;
      });
    }

    return {
      labels: hourlyLabels,
      datasets: [{
        label: 'Transactions par Heure',
        data: hourlyData,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }

  // Données par défaut pour les graphiques
  private getDefaultTransactionCharts(): TransactionChartData {
    return {
      perDay: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [{
          label: 'Transactions par Jour',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      },
      perStatus: {
        labels: ['Succès', 'Échec', 'En attente'],
        datasets: [{
          label: 'Transactions par Statut',
          data: [0, 0, 0],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)'
          ],
          borderWidth: 1
        }]
      },
      perSource: {
        labels: ['ATM', 'POS', 'Online'],
        datasets: [{
          label: 'Transactions par Source',
          data: [0, 0, 0],
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1
        }]
      },
      perMonth: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Transactions par Mois',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          fill: true
        }]
      },
      perHour: {
        labels: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
        datasets: [{
          label: 'Transactions par Heure',
          data: new Array(24).fill(0),
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2,
          fill: true
        }]
      }
    };
  }

  private getDefaultIncidentCharts(): IncidentChartData {
    return {
      perStatus: {
        labels: ['Non traité', 'En cours', 'Résolu'],
        datasets: [{
          label: 'Incidents par Statut',
          data: [0, 0, 0],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(34, 197, 94, 1)'
          ],
          borderWidth: 1
        }]
      },
      perMonth: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Incidents par Mois',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          fill: true
        }]
      },
      perPriority: {
        labels: ['Haute', 'Moyenne', 'Basse'],
        datasets: [{
          label: 'Incidents par Priorité',
          data: [0, 0, 0],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(34, 197, 94, 1)'
          ],
          borderWidth: 1
        }]
      }
    };
  }

  private getDefaultResponseCharts(): ResponseChartData {
    return {
             perStatus: {
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
      perMonth: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Réponses par Mois',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          fill: true
        }]
      },
      successRate: {
        labels: ['Taux de Succès'],
        datasets: [{
          label: 'Taux de Succès (%)',
          data: [60],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        }]
      }
    };
  }
} 