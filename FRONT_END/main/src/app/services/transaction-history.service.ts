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

  // Tu peux ajouter ici d'autres méthodes pour l'historique si besoin, en suivant le même modèle.
} 