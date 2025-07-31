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
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NotificationService } from 'src/app/services/notification.service';
import { interval, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

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
  
  // Configuration pour la suppression automatique des notifications lues
  autoDeleteReadNotifications = true; // Mettre à false pour désactiver

  constructor(
    private notificationService: NotificationService,
    public authService: AuthService,
    private router: Router
  ) {}

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
      
      // Supprimer automatiquement les notifications lues si activé
      if (this.autoDeleteReadNotifications) {
        this.removeReadNotifications();
      }
    });
  }

  removeReadNotifications(): void {
    const readNotifications = this.notifications.filter(n => n.read);
    
    readNotifications.forEach(notification => {
      this.notificationService.deleteNotification(notification.id).subscribe({
        next: () => {
          console.log('✅ Notification lue supprimée:', notification.id);
          // Retirer de la liste locale
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
        },
        error: (error: any) => {
          console.error('❌ Erreur lors de la suppression de la notification:', error);
        }
      });
    });
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        // Marquer toutes les notifications comme lues localement
        this.notifications.forEach((n) => (n.read = true));
        console.log('✅ Toutes les notifications ont été marquées comme lues');
        
        // Supprimer automatiquement toutes les notifications lues si activé
        if (this.autoDeleteReadNotifications) {
          this.removeReadNotifications();
        }
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du marquage des notifications:', error);
        // En cas d'erreur, on marque quand même localement pour l'UX
        this.notifications.forEach((n) => (n.read = true));
        // Et on supprime quand même si activé
        if (this.autoDeleteReadNotifications) {
          this.removeReadNotifications();
        }
      }
    });
  }

  deleteNotification(notificationId: number, event: MouseEvent): void {
    event.stopPropagation(); // Empêche le menu de se fermer
    this.notificationService.deleteNotification(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    });
  }

  markNotificationAsRead(notificationId: number): void {
    this.notificationService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        // Marquer la notification comme lue localement
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
          
          // Supprimer automatiquement la notification lue si activé
          if (this.autoDeleteReadNotifications) {
            this.notificationService.deleteNotification(notificationId).subscribe({
              next: () => {
                console.log('✅ Notification lue supprimée:', notificationId);
                // Retirer de la liste locale
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
              },
              error: (error: any) => {
                console.error('❌ Erreur lors de la suppression de la notification:', error);
              }
            });
          }
        }
        console.log('✅ Notification marquée comme lue:', notificationId);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du marquage de la notification:', error);
        // En cas d'erreur, on marque quand même localement pour l'UX
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
          
          // Supprimer quand même si activé
          if (this.autoDeleteReadNotifications) {
            this.notificationService.deleteNotification(notificationId).subscribe({
              next: () => {
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
              },
              error: (deleteError: any) => {
                console.error('❌ Erreur lors de la suppression de la notification:', deleteError);
              }
            });
          }
        }
      }
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

  trackByNotification(index: number, notification: Notification): number {
    return notification.id;
  }

  toggleAutoDelete(): void {
    this.autoDeleteReadNotifications = !this.autoDeleteReadNotifications;
    console.log('🔄 Auto-suppression des notifications:', this.autoDeleteReadNotifications ? 'ACTIVÉE' : 'DÉSACTIVÉE');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/authentication/login']);
  }
}