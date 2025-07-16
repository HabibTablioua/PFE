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
  loading = true;
  error = '';
  constructor(private transactionService: TransactionHistoryService) {}
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
  ngOnInit() {
    this.loading = true;
    this.transactionService.getTransactionsPerDay().subscribe({
      next: (stats: {date: string, count: number}[]) => {
        this.loading = false;
        this.dailyStats = stats;
        this.totalTransactions = stats.reduce((sum: number, s: {count: number}) => sum + s.count, 0);
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
  }
}