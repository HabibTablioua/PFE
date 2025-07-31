import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Account {
  pan: string;
  accountNumber?: string;
  holderName?: string;
  balance?: number;
  currency?: string;
  status?: string;
  type?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  stolen?: boolean;
  lost?: boolean;
  blacklisted?: boolean;
  restricted?: boolean;
  allowedOperations?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8088/api/accounts';

  constructor(private http: HttpClient) { }

  // Récupérer tous les comptes
  getAccounts(): Observable<Account[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Account[]>(this.apiUrl, { headers });
  }

  // Récupérer un compte par PAN
  getAccountByPan(pan: string): Observable<Account> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Account>(`${this.apiUrl}/${pan}`, { headers });
  }

  // Vérifier si un PAN existe déjà
  checkPanExists(pan: string): Observable<boolean> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Account>(`${this.apiUrl}/${pan}`, { headers })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  // Créer un nouveau compte
  createAccount(account: Account): Observable<Account> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Account>(this.apiUrl, account, { headers });
  }

  // Mettre à jour un compte
  updateAccount(pan: string, account: Account): Observable<Account> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Account>(`${this.apiUrl}/${pan}`, account, { headers });
  }

  // Supprimer un compte
  deleteAccount(pan: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/${pan}`, { headers });
  }

  // Récupérer les comptes par statut
  getAccountsByStatus(status: string): Observable<Account[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Account[]>(`${this.apiUrl}/status/${status}`, { headers });
  }

  // Récupérer les comptes avec solde positif
  getAccountsWithPositiveBalance(): Observable<Account[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Account[]>(`${this.apiUrl}/positive-balance`, { headers });
  }

  // Validation de l'algorithme de Luhn pour le PAN
  validateLuhn(pan: string): boolean {
    if (!pan || pan.length < 13) return false;
    
    let sum = 0;
    let alternate = false;
    
    // Parcourir le PAN de droite à gauche
    for (let i = pan.length - 1; i >= 0; i--) {
      let digit = parseInt(pan.charAt(i));
      
      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }
      
      sum += digit;
      alternate = !alternate;
    }
    
    return (sum % 10) === 0;
  }

  // Générer un PAN valide pour les tests
  generateValidPan(): string {
    // Générer 15 chiffres aléatoires
    let pan = '';
    for (let i = 0; i < 15; i++) {
      pan += Math.floor(Math.random() * 10);
    }
    
    // Calculer le chiffre de contrôle (Luhn)
    let sum = 0;
    let alternate = false;
    
    for (let i = pan.length - 1; i >= 0; i--) {
      let digit = parseInt(pan.charAt(i));
      
      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }
      
      sum += digit;
      alternate = !alternate;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return pan + checkDigit;
  }

  // Méthodes utilitaires
  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'success';
      case 'CLOSED': return 'danger';
      case 'SUSPENDED': return 'warning';
      default: return 'secondary';
    }
  }

  getTypeLabel(type: string): string {
    switch (type?.toUpperCase()) {
      case 'CURRENT': return 'Compte Courant';
      case 'SAVINGS': return 'Compte Épargne';
      case 'BUSINESS': return 'Compte Professionnel';
      default: return type || 'Non défini';
    }
  }

  formatBalance(balance: number | undefined, currency: string = 'MAD'): string {
    if (balance === undefined || balance === null) return '0.00 ' + currency;
    return balance.toFixed(2) + ' ' + currency;
  }

  isAccountActive(account: Account): boolean {
    return account.status?.toUpperCase() === 'OPEN' && 
           !account.blacklisted && 
           !account.lost && 
           !account.stolen && 
           !account.restricted;
  }

  formatCreatedDate(createdAt: string | undefined): string {
    if (!createdAt) return 'Non définie';
    try {
      const date = new Date(createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Si c'est aujourd'hui
      if (date.toDateString() === today.toDateString()) {
        return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Si c'est hier
      if (date.toDateString() === yesterday.toDateString()) {
        return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Sinon, afficher la date complète
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  }
} 