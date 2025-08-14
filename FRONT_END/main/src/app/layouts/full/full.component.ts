import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CoreService } from 'src/app/services/core.service';

import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { NavService } from '../../services/nav.service';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AppNavItemComponent } from './sidebar/nav-item/nav-item.component';
import { navItems } from './sidebar/sidebar-data';
import { NavItem } from './sidebar/nav-item/nav-item';
import { AppTopstripComponent } from './top-strip/topstrip.component';
import { AuthService } from '../../services/auth.service';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';

@Component({
  selector: 'app-full',
  imports: [
    RouterModule,
    AppNavItemComponent,
    MaterialModule,
    CommonModule,
    SidebarComponent,
    NgScrollbarModule,
    TablerIconsModule,
    HeaderComponent,
    AppTopstripComponent
  ],
  templateUrl: './full.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None
})
export class FullComponent implements OnInit {
  navItems: NavItem[] = [];

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav;
  resView = false;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;
  //get options from service
  options = this.settings.getOptions();
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  constructor(
    private settings: CoreService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
        if (this.options.sidenavCollapsed == false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
      });

    // Initialize project theme with options

    // This is for scroll to top
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e) => {
        this.content.scrollTo({ top: 0 });
      });
  }

  ngOnInit(): void { 
    this.filterNavItemsByRole();
    console.log('NavItems filtrés par rôle:', this.navItems);
    
    // Debug des rôles utilisateur
    this.debugUserRoles();
    
    // Écouter les changements de l'utilisateur courant
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('🔄 Utilisateur changé, rafraîchissement du sidebar...');
        this.filterNavItemsByRole();
        this.cdr.detectChanges();
        this.debugUserRoles(); // Debug après changement
      }
    });
  }

  /**
   * Méthode de debug pour vérifier les rôles
   */
  debugUserRoles(): void {
    const currentUser = this.authService.getCurrentUserValue();
    console.log('🔍 === DEBUG UTILISATEUR ===');
    console.log('👤 Utilisateur complet:', currentUser);
    console.log('🔑 Token présent:', !!localStorage.getItem('token'));
    console.log('👑 Est admin:', this.authService.isAdmin());
    console.log('👤 Est user:', this.authService.isUser());
    console.log('🎯 Rôles:', currentUser?.roles);
    console.log('📋 Éléments du sidebar:', this.navItems.length);
    console.log('🔍 === FIN DEBUG ===');
  }

  /**
   * Filtre les éléments de navigation selon le rôle de l'utilisateur
   */
  private filterNavItemsByRole(): void {
    const currentUser = this.authService.getCurrentUserValue();
    const isAdmin = currentUser ? this.authService.isAdmin() : false;

    console.log('🔍 Filtrage des éléments de navigation:');
    console.log('👤 Utilisateur courant:', currentUser);
    console.log('👑 Est admin:', isAdmin);

    this.navItems = navItems.filter(item => {
      // Si l'élément n'a pas de restriction de rôle, l'afficher pour tous
      if (!item.roles) {
        console.log(`✅ ${item.displayName || item.navCap}: Aucune restriction de rôle`);
        return true;
      }

      // Si l'utilisateur est admin, afficher TOUS les éléments
      if (isAdmin) {
        console.log(`👑 ${item.displayName || item.navCap}: Admin - Affiché`);
        return true;
      }

      // Sinon, vérifier si l'utilisateur a au moins un des rôles requis
      const hasRequiredRole = this.authService.hasAnyRole(...item.roles);
      console.log(`👤 ${item.displayName || item.navCap}: User - Rôle requis: ${item.roles}, Afficher: ${hasRequiredRole}`);
      return hasRequiredRole;
    });

    console.log('📋 Éléments filtrés:', this.navItems.map(item => item.displayName || item.navCap));
  }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }

  resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    //this.settings.setOptions(this.options);
  }

}