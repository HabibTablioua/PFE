import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    console.log('AuthGuard: Vérification de l\'authentification...');
    
    if (!this.authService.isAuthenticated()) {
      console.log('AuthGuard: Utilisateur non authentifié, redirection vers login');
      this.router.navigate(['/authentication/login']);
      return of(false);
    }

    // Vérifier les restrictions de rôle pour certaines routes
    const requiredRole = route.data['requiredRole'];
    if (requiredRole) {
      if (!this.authService.hasRole(requiredRole)) {
        console.log(`AuthGuard: Rôle requis ${requiredRole} non trouvé, redirection vers dashboard`);
        this.router.navigate(['/dashboard']);
        return of(false);
      }
    }

    // Vérifier les restrictions pour les utilisateurs non-admin
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser && !this.authService.isAdmin()) {
      // Routes interdites pour les utilisateurs non-admin
      const restrictedRoutes = ['/dashboard', '/accounts', '/users', '/cards'];
      const currentUrl = this.router.url;
      
      if (restrictedRoutes.some(route => currentUrl.startsWith(route))) {
        console.log('AuthGuard: Route restreinte pour utilisateur non-admin, redirection vers message-form');
        this.router.navigate(['/message-form']);
        return of(false);
      }
    }

    console.log('AuthGuard: Accès autorisé');
    return of(true);
  }
}