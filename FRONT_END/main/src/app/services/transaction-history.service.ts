import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionHistoryService {
    private apiUrl = 'http://localhost:8088/api/history'; // adapte l'URL si besoin

  constructor(private http: HttpClient) {}

  getTransactionsPerDay(): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<any[]>(`${this.apiUrl}/per-day`, { headers });
  }

  getTransactionsPerStatus(): Observable<any[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<any[]>(`${this.apiUrl}/per-status`, { headers });
  }

  getTotalTransactions(): Observable<number> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<number>(`${this.apiUrl}/count`, { headers });
  }

  getTransactionsPerSource(): Observable<{source: string, count: number}[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<{source: string, count: number}[]>(`${this.apiUrl}/per-source`, { headers });
  }

  // Tu peux ajouter ici d'autres méthodes pour l'historique si besoin, en suivant le même modèle.
} 