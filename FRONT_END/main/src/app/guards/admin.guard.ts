import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService, User } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    console.log('AdminGuard: Vérification de l\'accès...');
    
    // D'abord vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      console.log('AdminGuard: Utilisateur non authentifié, redirection vers login');
      this.router.navigate(['/authentication/login']);
      return of(false);
    }

    // Ensuite vérifier le rôle ADMIN
    return this.authService.getCurrentUser().pipe(
      map((user: User | null) => {
        console.log('AdminGuard: Utilisateur courant:', user);
        
        if (user && user.role === 'ADMIN') {
          console.log('AdminGuard: Accès autorisé pour l\'admin');
          return true;
        } else {
          console.log('AdminGuard: Accès refusé - rôle insuffisant ou utilisateur null');
          // Rediriger vers le dashboard au lieu de la page de login
          this.router.navigate(['/dashboard']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('AdminGuard: Erreur lors de la vérification:', error);
        this.router.navigate(['/authentication/login']);
        return of(false);
      })
    );
  }
} 