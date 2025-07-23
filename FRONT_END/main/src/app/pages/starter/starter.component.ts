import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { AppSalesOverviewComponent } from 'src/app/components/sales-overview/sales-overview.component';
import { AppYearlyBreakupComponent } from 'src/app/components/yearly-breakup/yearly-breakup.component';
import { AppMonthlyEarningsComponent } from 'src/app/components/monthly-earnings/monthly-earnings.component';
import { AppRecentTransactionsComponent } from 'src/app/components/recent-transactions/recent-transactions.component';
import { AppProductPerformanceComponent } from 'src/app/components/product-performance/product-performance.component';
import { AppBlogCardsComponent } from 'src/app/components/blog-card/blog-card.component';
import { CommonModule } from '@angular/common';
import { provideCharts, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TransactionHistoryService } from 'src/app/services/transaction-history.service';
import { UserService } from 'src/app/services/user.service';
import { IncidentService } from 'src/app/services/incident.service';
import { ResponseService } from 'src/app/services/response.service';


@Component({
  selector: 'app-starter',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [provideCharts()],
})
export class StarterComponent implements OnInit {
  dailyStats: {date: string, count: number}[] = [];
  totalTransactions = 0;
  userCount = 0;
  incidentCount = 0;
  loading = true;
  error = '';
  incidentNonTraite = 0;
  incidentEnCours = 0;
  incidentResolu = 0;
  incidentStatusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Non traité', 'En cours', 'Résolu'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#ff5252', '#ffb300', '#43a047'] }]
  };
  successResponseCount = 0;
  failedResponseCount = 0;
  responseStatusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Réponses approuvées', 'Réponses non approuvées'],
    datasets: [{ data: [0, 0], backgroundColor: ['#00c6ff', '#ff5252'] }]
  };
  constructor(
    private transactionService: TransactionHistoryService,
    private userService: UserService,
    private incidentService: IncidentService,
    private responseService: ResponseService
  ) {}
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Transactions par jour', backgroundColor: '#2196f3' }
    ]
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#66BB6A', '#FFA726', '#EF5350', '#42A5F5', '#AB47BC'] }]
  };
  topSourcesChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Top 5 sources', backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ef5350'] }
    ]
  };
  topSourcesChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top 5 sources de transactions' }
    }
  };
  ngOnInit() {
    this.loading = true;
    this.transactionService.getTotalTransactions().subscribe({
      next: (count: number) => {
        this.totalTransactions = count;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du nombre total de transactions';
      }
    });
    this.userService.getUserCount().subscribe({
      next: (count: number) => {
        this.userCount = count;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du nombre total d\'utilisateurs';
      }
    });
    this.incidentService.getIncidentCount().subscribe({
      next: (count: number) => {
        this.incidentCount = count;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du nombre total d\'incidents';
      }
    });
    this.transactionService.getTransactionsPerDay().subscribe({
      next: (stats: {date: string, count: number}[]) => {
        this.loading = false;
        this.dailyStats = stats;
        this.barChartData.labels = stats.map((s: {date: string}) => s.date);
        this.barChartData.datasets[0].data = stats.map((s: {count: number}) => s.count);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des statistiques';
      }
    });
    this.transactionService.getTransactionsPerStatus().subscribe((stats: {status: string, count: number}[]) => {
      // Trier par nombre décroissant
      const sorted = stats.sort((a, b) => b.count - a.count);
      // Prendre les 3 premiers, grouper le reste
      const top = sorted.slice(0, 3);
      const others = sorted.slice(3);
      let labels = top.map(s => s.status);
      let data = top.map(s => s.count);
      if (others.length > 0) {
        labels.push('Autres');
        data.push(others.reduce((sum, s) => sum + s.count, 0));
      }
      this.pieChartData.labels = labels;
      this.pieChartData.datasets[0].data = data;
    });
    this.incidentService.getNonTraiteIncidentCount().subscribe(count => {
      this.incidentNonTraite = count;
      this.updateIncidentStatusChart();
    });
    this.incidentService.getEnCoursIncidentCount().subscribe(count => {
      this.incidentEnCours = count;
      this.updateIncidentStatusChart();
    });
    this.incidentService.getResoluIncidentCount().subscribe(count => {
      this.incidentResolu = count;
      this.updateIncidentStatusChart();
    });
    this.responseService.getSuccessResponseCount().subscribe(count => {
      this.successResponseCount = count;
      this.updateResponseStatusChart();
    });
    this.responseService.getFailedResponseCount().subscribe(count => {
      this.failedResponseCount = count;
      this.updateResponseStatusChart();
    });
    this.transactionService.getTransactionsPerSource().subscribe(sources => {
      const top5 = sources.slice(0, 5);
      this.topSourcesChartData.labels = top5.map(s => s.source || 'Inconnu');
      this.topSourcesChartData.datasets[0].data = top5.map(s => s.count);
    });
  }
  updateIncidentStatusChart() {
    this.incidentStatusChartData.datasets[0].data = [
      this.incidentNonTraite,
      this.incidentEnCours,
      this.incidentResolu
    ];
  }
  updateResponseStatusChart() {
    this.responseStatusChartData.datasets[0].data = [
      this.successResponseCount,
      this.failedResponseCount
    ];
  }
}