import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = environment.authUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier s'il y a un utilisateur stocké au démarrage
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const userJson = localStorage.getItem('user');
    if (userJson && userJson !== 'undefined') {
      try {
        this.currentUserSubject.next(JSON.parse(userJson));
      } catch (e) {
        console.error('Erreur lors du parsing du user stocké :', e);
        this.currentUserSubject.next(null);
      }
    } else {
      this.currentUserSubject.next(null);
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, userData, { observe: 'response' });
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  // Méthodes de gestion des utilisateurs (déplacées vers UserService)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.authUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.authUrl}/users/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.authUrl}/register`, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.authUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.authUrl}/users/${id}`);
  }

  deleteMultipleUsers(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/users/delete-multiple`, { ids });
  }
} 