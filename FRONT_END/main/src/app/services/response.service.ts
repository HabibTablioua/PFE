import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResponseService {
  private apiUrl = 'http://localhost:8088/api/response'; // adapte l'URL si besoin

  constructor(private http: HttpClient) {}

  getSuccessResponseCount(): Observable<number> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<number>(`${this.apiUrl}/history/count-success`, { headers });
  }

  getFailedResponseCount(): Observable<number> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<number>(`${this.apiUrl}/history/count-failed`, { headers });
  }
} 