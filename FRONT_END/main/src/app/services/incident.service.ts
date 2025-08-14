import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Incident } from '../models/incident.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private apiUrl = 'http://localhost:8088/api/incidents'; // Adapter selon le Gateway

  constructor(
    private http: HttpClient, 
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  // Méthode principale pour récupérer les incidents selon le rôle
  getIncidentsByRole(): Observable<Incident[]> {
    const user = this.authService.getCurrentUserValue();
    
    if (user && user.roles && user.roles.includes('ADMIN')) {
      // Admin : voir tous les incidents
      return this.getAll();
    } else if (user?.id) {
      // Utilisateur normal : voir seulement ses incidents
      return this.getByUserId(user.id);
    } else {
      // Pas d'utilisateur connecté ou pas d'ID
      return this.getAll(); // Fallback vers tous les incidents
    }
  }

  // Récupérer les incidents d'un utilisateur spécifique
  getByUserId(userId: number): Observable<Incident[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Log pour debug
    console.log(`🔍 Récupération des incidents pour l'utilisateur ID: ${userId}`);
    
    return this.http.get<Incident[]>(`${this.apiUrl}/user/${userId}`, { headers });
  }

  // Récupérer tous les incidents (pour les admins)
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

  deleteAll(): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.delete(this.apiUrl, { headers });
  }

  getIncidentCount(): Observable<number> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<number>(`${this.apiUrl}/count`, { headers });
  }

  getNonTraiteIncidentCount(): Observable<number> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<number>(`${this.apiUrl}/count-non-traite`, { headers });
  }
  getResoluIncidentCount(): Observable<number> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<number>(`${this.apiUrl}/count-resolu`, { headers });
  }
  getEnCoursIncidentCount(): Observable<number> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    // On compte les incidents EN_COURS via un endpoint générique (à créer côté backend si besoin)
    return this.http.get<number>(`${this.apiUrl}/count-by-status?status=EN_COURS`, { headers });
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Fermer', { duration: 3000, panelClass: 'snackbar-success' });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Fermer', { duration: 3000, panelClass: 'snackbar-error' });
  }
}