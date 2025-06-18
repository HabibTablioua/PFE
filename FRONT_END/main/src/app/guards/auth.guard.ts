import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
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

  canActivate(): Observable<boolean> {
    console.log('AuthGuard: Vérification de l\'authentification...');
    
    if (this.authService.isAuthenticated()) {
      console.log('AuthGuard: Utilisateur authentifié, accès autorisé');
      return of(true);
    } else {
      console.log('AuthGuard: Utilisateur non authentifié, redirection vers login');
      this.router.navigate(['/authentication/login']);
      return of(false);
    }
  }
} 