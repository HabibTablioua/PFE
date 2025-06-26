import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8088/api/notifications'; // adapte l'URL si besoin

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<any[]> {
    const token = localStorage.getItem('token'); // Correction de la clé du token
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  deleteNotification(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
} 