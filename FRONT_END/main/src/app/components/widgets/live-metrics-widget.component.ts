import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { TransactionStatsService } from '../../services/transaction-stats.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface LiveMetrics {
  transactionsPerMinute: number;
  successRate: number;
  activeUsers: number;
  errorRate: number;
  lastUpdated: Date;
}

@Component({
  selector: 'app-live-metrics-widget',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="live-metrics-widget">
      <div class="widget-header">
        <h3 class="widget-title">⚡ Métriques Temps-Réel</h3>
        <div class="last-updated">
          <mat-icon>schedule</mat-icon>
          {{ lastUpdated | date:'HH:mm:ss' }}
        </div>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card primary">
          <div class="metric-icon">
            <mat-icon>speed</mat-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ liveMetrics.transactionsPerMinute }}</div>
            <div class="metric-label">Transactions/min</div>
          </div>
          <div class="metric-trend positive" *ngIf="trends.transactions > 0">
            <mat-icon>trending_up</mat-icon>
            +{{ trends.transactions }}%
          </div>
        </div>

        <div class="metric-card success">
          <div class="metric-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ liveMetrics.successRate }}%</div>
            <div class="metric-label">Taux de succès</div>
          </div>
          <div class="metric-trend positive" *ngIf="trends.success > 0">
            <mat-icon>trending_up</mat-icon>
            +{{ trends.success }}%
          </div>
        </div>

        <div class="metric-card info">
          <div class="metric-icon">
            <mat-icon>people</mat-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ liveMetrics.activeUsers }}</div>
            <div class="metric-label">Utilisateurs actifs</div>
          </div>
          <div class="metric-trend neutral">
            <mat-icon>remove</mat-icon>
            Stable
          </div>
        </div>

        <div class="metric-card warning">
          <div class="metric-icon">
            <mat-icon>error</mat-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ liveMetrics.errorRate }}%</div>
            <div class="metric-label">Taux d'erreur</div>
          </div>
          <div class="metric-trend negative" *ngIf="trends.errors > 0">
            <mat-icon>trending_down</mat-icon>
            +{{ trends.errors }}%
          </div>
        </div>
      </div>

      <div class="widget-footer">
        <button mat-button color="primary" (click)="refreshMetrics()">
          <mat-icon>refresh</mat-icon>
          Actualiser
        </button>
        <div class="status-indicator" [class.online]="isOnline">
          <div class="status-dot"></div>
          {{ isOnline ? 'En ligne' : 'Hors ligne' }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .live-metrics-widget {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .widget-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .last-updated {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .last-updated mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .metric-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .metric-card.primary {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
    }

    .metric-card.success {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
    }

    .metric-card.info {
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      color: white;
    }

    .metric-card.warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }

    .metric-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
    }

    .metric-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .metric-content {
      flex: 1;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 0.75rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .metric-trend.positive {
      color: #22c55e;
    }

    .metric-trend.negative {
      color: #ef4444;
    }

    .metric-trend.neutral {
      color: #6b7280;
    }

    .metric-trend mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .widget-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
      animation: pulse 2s infinite;
    }

    .status-dot.online {
      background: #22c55e;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      
      .widget-footer {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }
    }
  `]
})
export class LiveMetricsWidgetComponent implements OnInit, OnDestroy {
  liveMetrics: LiveMetrics = {
    transactionsPerMinute: 0,
    successRate: 0,
    activeUsers: 0,
    errorRate: 0,
    lastUpdated: new Date()
  };

  trends = {
    transactions: 0,
    success: 0,
    errors: 0
  };

  isOnline = true;
  lastUpdated = new Date();
  private subscription = new Subscription();

  constructor(private transactionStatsService: TransactionStatsService) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadMetrics(): void {
    // Simuler des données temps-réel
    this.liveMetrics = {
      transactionsPerMinute: Math.floor(Math.random() * 50) + 10,
      successRate: Math.floor(Math.random() * 20) + 80,
      activeUsers: Math.floor(Math.random() * 100) + 50,
      errorRate: Math.floor(Math.random() * 10) + 1,
      lastUpdated: new Date()
    };

    this.trends = {
      transactions: Math.floor(Math.random() * 15),
      success: Math.floor(Math.random() * 5),
      errors: Math.floor(Math.random() * 8)
    };

    this.lastUpdated = new Date();
    this.isOnline = Math.random() > 0.1; // 90% de chance d'être en ligne
  }

  startAutoRefresh(): void {
    const refreshSub = interval(30000).subscribe(() => {
      this.loadMetrics();
    });
    this.subscription.add(refreshSub);
  }

  refreshMetrics(): void {
    this.loadMetrics();
  }
} 