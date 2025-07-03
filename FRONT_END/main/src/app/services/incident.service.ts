import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Incident } from '../models/incident.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private apiUrl = 'http://localhost:8088/api/incidents'; // Adapter selon le Gateway

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  getAll(): Observable<Incident[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<Incident[]>(this.apiUrl, { headers });
  }

  create(incident: Partial<Incident>): Observable<Incident> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<Incident>(this.apiUrl, incident, { headers });
  }

  update(id: number, incident: Partial<Incident>): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.put(`${this.apiUrl}/${id}/full`, incident, { headers });
  }

  delete(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Fermer', { duration: 3000, panelClass: 'snackbar-success' });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Fermer', { duration: 3000, panelClass: 'snackbar-error' });
  }
} 