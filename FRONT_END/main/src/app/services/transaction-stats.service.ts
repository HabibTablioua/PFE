import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TransactionSourceStats {
  source: string;
  count: number;
  percentage: number;
}

export interface TransactionStatusStats {
  status: string;
  count: number;
  percentage: number;
}

export interface TransactionPerDayStats {
  date: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionStatsService {
  private baseUrl = environment.apiUrl + '/history';

  constructor(private http: HttpClient) {}

  // Récupérer les statistiques par source (Top 5)
  getTransactionSourcesStats(): Observable<TransactionSourceStats[]> {
    return this.http.get<TransactionSourceStats[]>(`${this.baseUrl}/per-source`);
  }

  // Récupérer les statistiques par statut
  getTransactionStatusStats(): Observable<TransactionStatusStats[]> {
    return this.http.get<TransactionStatusStats[]>(`${this.baseUrl}/per-status`);
  }

  // Récupérer les statistiques par jour
  getTransactionPerDayStats(): Observable<TransactionPerDayStats[]> {
    return this.http.get<TransactionPerDayStats[]>(`${this.baseUrl}/per-day`);
  }

  // Récupérer le nombre total de transactions
  getTotalTransactionsCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  // Récupérer les transactions avec filtres
  getFilteredTransactions(
    mti?: string,
    format?: string,
    source?: string,
    startDate?: string,
    endDate?: string,
    searchTerm?: string
  ): Observable<any[]> {
    let params: any = {};
    if (mti) params.mti = mti;
    if (format) params.format = format;
    if (source) params.source = source;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (searchTerm) params.searchTerm = searchTerm;

    return this.http.get<any[]>(`${this.baseUrl}`, { params });
  }
} 