import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { NavItem } from './nav-item';
import { Router } from '@angular/router';
import { NavService } from '../../../../services/nav.service';
import { AuthService } from '../../../../services/auth.service';

import { TranslateModule } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-item',
  imports: [TranslateModule, TablerIconsModule, MaterialModule, CommonModule],
  templateUrl: './nav-item.component.html',
  styleUrls: [],
})
export class AppNavItemComponent implements OnChanges {
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() item: NavItem | any;

  expanded: any = false;

  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() depth: any;

  constructor(
    public navService: NavService, 
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnChanges() {
    const url = this.navService.currentUrl();
    if (this.item.route && url) {
      this.expanded = url.indexOf(`/${this.item.route}`) === 0;
      this.ariaExpanded = this.expanded;
    }
  }

  onItemSelected(item: NavItem) {
    // Gérer les actions spéciales
    if (item.action === 'logout') {
      this.handleLogout();
      return;
    }

    // Gérer la navigation normale
    if (!item.children || !item.children.length) {
      if (item.route) {
        this.router.navigate([item.route]);
      }
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
    
    //scroll
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    if (!this.expanded) {
      if (window.innerWidth < 1024) {
        this.notify.emit();
      }
    }
  }

  /**
   * Gère la déconnexion de l'utilisateur
   */
  private handleLogout(): void {
    console.log('🔄 Déconnexion en cours...');
    this.authService.logout();
    this.router.navigate(['/authentication/login']);
    
    // Fermer le sidebar mobile si nécessaire
    if (window.innerWidth < 1024) {
      this.notify.emit();
    }
  }

  openExternalLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  onSubItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      if (this.expanded && window.innerWidth < 1024) {
        this.notify.emit();
      }
    }
  }
}
