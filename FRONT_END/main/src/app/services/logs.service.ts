import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LogsService {
  private apiUrl = environment.apiUrl + '/logs';

  constructor(private http: HttpClient) {}

  getLogs(filters: any = {}, page: number = 0, size: number = 20): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    const params = { ...filters, page, size };
    return this.http.get<any>(this.apiUrl, { params, headers });
  }

  exportLogs(type: string, filters: any) {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    window.open(`${this.apiUrl}/export/${type}?${new URLSearchParams(filters).toString()}`, '_blank');
  }

  deleteLog(id: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  deleteLogsBatch(ids: number[]): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.post(`${this.apiUrl}/delete-batch`, ids, { headers });
  }
} 