import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NotificationService } from 'src/app/services/notification.service';
import { interval, Subscription } from 'rxjs';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  read: boolean;
  dateTime: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
  ],
  providers: [NotificationService],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-15px)' }),
          stagger('50ms',
            animate('300ms ease-out',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          )
        ], { optional: true })
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();

  notifications: Notification[] = [];
  private pollingSubscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
    // Ajout du polling toutes les 5 secondes
    this.pollingSubscription = interval(5000).subscribe(() => this.loadNotifications());
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe((data: any[]) => {
      console.log('Notifications reçues du service:', data);
      this.notifications = data
        .map((n) => ({
          id: n.id,
          message: n.message,
          type: n.type || 'info',
          read: n.read ?? false,
          dateTime: n.dateTime,
        }))
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    });
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    // Here you would also call a service method to update the backend
    // this.notificationService.markAllAsRead().subscribe();
  }

  deleteNotification(notificationId: number, event: MouseEvent): void {
    event.stopPropagation(); // Empêche le menu de se fermer
    this.notificationService.deleteNotification(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    });
  }

  get badgeColor(): string {
    return this.notifications.some(n => !n.read && n.type === 'error') ? 'warn' : 'primary';
  }

  deleteAllNotifications(): void {
    this.notificationService.deleteAllNotifications().subscribe(() => {
      this.notifications = [];
    });
  }
}