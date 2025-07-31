import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

export interface MetricWidgetData {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral' | 'error';
  icon: string;
  colorClass: string;
  description?: string;
}

@Component({
  selector: 'app-metric-widget',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="metric-widget" [ngClass]="data.colorClass" (click)="onWidgetClick()">
      <div class="metric-header">
        <span class="metric-title">{{ data.title }}</span>
        <div class="metric-icon">
          <mat-icon>{{ data.icon }}</mat-icon>
        </div>
      </div>
      <div class="metric-value">{{ data.value }}</div>
      <div class="metric-change" [ngClass]="data.changeType">
        <mat-icon *ngIf="data.changeType === 'positive'">trending_up</mat-icon>
        <mat-icon *ngIf="data.changeType === 'negative'">trending_down</mat-icon>
        <mat-icon *ngIf="data.changeType === 'error'">error</mat-icon>
        {{ data.change }}
      </div>
      <div class="metric-description" *ngIf="data.description">
        {{ data.description }}
      </div>
    </div>
  `,
  styles: [`
    .metric-widget {
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      color: white;
      cursor: pointer;
    }

    .metric-widget:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25);
    }

    .metric-widget.blue {
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      box-shadow: 0 8px 25px -5px rgba(6, 182, 212, 0.2);
    }

    .metric-widget.red {
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      box-shadow: 0 8px 25px -5px rgba(244, 63, 94, 0.2);
    }

    .metric-widget.green {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      box-shadow: 0 8px 25px -5px rgba(34, 197, 94, 0.2);
    }

    .metric-widget.orange {
      background: linear-gradient(135deg, #f97316, #ea580c);
      box-shadow: 0 8px 25px -5px rgba(249, 115, 22, 0.2);
    }

    .metric-widget.purple {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      box-shadow: 0 8px 25px -5px rgba(139, 92, 246, 0.2);
    }

    .metric-widget.teal {
      background: linear-gradient(135deg, #14b8a6, #0d9488);
      box-shadow: 0 8px 25px -5px rgba(20, 184, 166, 0.2);
    }

    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .metric-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-icon {
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

    .metric-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      margin-bottom: 8px;
      line-height: 1;
    }

    .metric-change {
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }

    .metric-change mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .metric-change.positive {
      color: rgba(255, 255, 255, 0.95);
    }

    .metric-change.negative {
      color: rgba(255, 255, 255, 0.95);
    }

    .metric-change.error {
      color: rgba(255, 255, 255, 0.95);
    }

    .metric-change.neutral {
      color: rgba(255, 255, 255, 0.8);
    }

    .metric-description {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 8px;
    }
  `]
})
export class MetricWidgetComponent {
  @Input() data!: MetricWidgetData;
  @Output() widgetClick = new EventEmitter<MetricWidgetData>();

  onWidgetClick(): void {
    this.widgetClick.emit(this.data);
  }
} 