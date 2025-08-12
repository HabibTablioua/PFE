import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Card {
  pan: string;
  cardNumber?: string;
  expiryDate: string;
  status: string;
  stolen: boolean;
  lost: boolean;
  blacklisted: boolean;
  restricted: boolean;
  type: string;
  issuer?: string;
  holderName: string;
  allowedOperations?: string;
  createdAt: string;
  updatedAt: string;
  accountPan?: string;
}

export interface CardStats {
  totalCards: number;
  activeCards: number;
  blockedCards: number;
  expiredCards: number;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = 'http://localhost:8088/api/cards';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les cartes
  getAllCards(): Observable<Card[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Card[]>(this.apiUrl, { headers });
  }

  // Récupérer une carte par PAN
  getCardByPan(pan: string): Observable<Card> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Card>(`${this.apiUrl}/${pan}`, { headers });
  }

  // Créer une nouvelle carte
  createCard(card: Partial<Card>): Observable<Card> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Card>(this.apiUrl, card, { headers });
  }

  // Mettre à jour une carte
  updateCard(pan: string, card: Partial<Card>): Observable<Card> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Card>(`${this.apiUrl}/${pan}`, card, { headers });
  }

  // Supprimer une carte
  deleteCard(pan: string): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${pan}`, { headers });
  }

  // Créer ou mettre à jour une carte
  createOrUpdateCard(card: Partial<Card>): Observable<Card> {
    if (card.pan) {
      // Si le PAN existe, c'est une mise à jour
      return this.updateCard(card.pan, card);
    } else {
      // Sinon, c'est une création
      return this.createCard(card);
    }
  }

  // Récupérer les cartes par statut
  getCardsByStatus(status: string): Observable<Card[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Card[]>(`${this.apiUrl}/status/${status}`, { headers });
  }

  // Récupérer les cartes par type
  getCardsByType(type: string): Observable<Card[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Card[]>(`${this.apiUrl}/type/${type}`, { headers });
  }

  // Compter le nombre total de cartes
  countCards(): Observable<number> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<number>(`${this.apiUrl}/count`, { headers });
  }

  // Compter les cartes actives
  countActiveCards(): Observable<number> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<number>(`${this.apiUrl}/count/active`, { headers });
  }

  // Compter les cartes bloquées
  countBlockedCards(): Observable<number> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<number>(`${this.apiUrl}/count/blocked`, { headers });
  }

  // Compter les cartes expirées
  countExpiredCards(): Observable<number> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<number>(`${this.apiUrl}/count/expired`, { headers });
  }

  // Récupérer les statistiques complètes
  getCardStats(): Observable<CardStats> {
    return new Observable(observer => {
      this.countCards().subscribe(total => {
        this.countActiveCards().subscribe(active => {
          this.countBlockedCards().subscribe(blocked => {
            this.countExpiredCards().subscribe(expired => {
              observer.next({
                totalCards: total,
                activeCards: active,
                blockedCards: blocked,
                expiredCards: expired
              });
              observer.complete();
            });
          });
        });
      });
    });
  }
} 