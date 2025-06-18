import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  roles?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface UserResponse {
  users: User[];
  total: number;
  page: number;
  size: number;
}

export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  roles?: string[];
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Récupérer tous les utilisateurs
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() })
      .pipe(
        tap(users => this.usersSubject.next(users))
      );
  }

  // Récupérer un utilisateur par ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  // Rechercher un utilisateur par email
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/email/${email}`, { headers: this.getHeaders() });
  }

  // Créer un nouvel utilisateur
  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData, { headers: this.getHeaders() })
      .pipe(
        tap(newUser => {
          const currentUsers = this.usersSubject.value;
          this.usersSubject.next([...currentUsers, newUser]);
        })
      );
  }

  // Mettre à jour un utilisateur
  updateUser(id: number, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData, { headers: this.getHeaders() })
      .pipe(
        tap(updatedUser => {
          const currentUsers = this.usersSubject.value;
          const updatedUsers = currentUsers.map(user => 
            user.id === id ? updatedUser : user
          );
          this.usersSubject.next(updatedUsers);
        })
      );
  }

  // Supprimer un utilisateur
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          const currentUsers = this.usersSubject.value;
          const filteredUsers = currentUsers.filter(user => user.id !== id);
          this.usersSubject.next(filteredUsers);
        })
      );
  }

  // Supprimer plusieurs utilisateurs
  deleteMultipleUsers(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/delete-multiple`, { ids }, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          const currentUsers = this.usersSubject.value;
          const filteredUsers = currentUsers.filter(user => !ids.includes(user.id!));
          this.usersSubject.next(filteredUsers);
        })
      );
  }

  // Activer/Désactiver un utilisateur
  toggleUserStatus(id: number, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/status`, { isActive }, { headers: this.getHeaders() })
      .pipe(
        tap(updatedUser => {
          const currentUsers = this.usersSubject.value;
          const updatedUsers = currentUsers.map(user => 
            user.id === id ? updatedUser : user
          );
          this.usersSubject.next(updatedUsers);
        })
      );
  }

  // Changer le mot de passe d'un utilisateur
  changeUserPassword(id: number, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${id}/password`, { password: newPassword }, { headers: this.getHeaders() });
  }

  // Récupérer les utilisateurs avec pagination
  getUsersPaginated(page: number = 0, size: number = environment.defaultPageSize, search?: string): Observable<UserResponse> {
    let url = `${this.apiUrl}/users?page=${page}&size=${size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<UserResponse>(url, { headers: this.getHeaders() });
  }

  // Récupérer les statistiques des utilisateurs
  getUserStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/stats`, { headers: this.getHeaders() });
  }

  // Vérifier si un email existe déjà
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/users/check-email/${email}`, { headers: this.getHeaders() });
  }

  // Exporter les utilisateurs
  exportUsers(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/users/export?format=${format}`, { 
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Importer des utilisateurs
  importUsers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.post(`${this.apiUrl}/users/import`, formData, { headers });
  }

  // Méthodes utilitaires
  getCurrentUsers(): User[] {
    return this.usersSubject.value;
  }

  refreshUsers(): void {
    this.getUsers().subscribe();
  }

  // Filtrer les utilisateurs localement
  filterUsers(searchTerm: string): User[] {
    const users = this.usersSubject.value;
    if (!searchTerm) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.firstname.toLowerCase().includes(term) ||
      user.lastname.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.role && user.role.toLowerCase().includes(term))
    );
  }

  // Obtenir les rôles disponibles
  getAvailableRoles(): string[] {
    return ['ADMIN', 'USER', 'MANAGER'];
  }

  // Valider un utilisateur
  validateUser(user: Partial<User>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!user.firstname || user.firstname.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    }

    if (!user.lastname || user.lastname.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    if (!user.email || !this.isValidEmail(user.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    if (!user.password || user.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (!user.roles || user.roles.length === 0) {
      errors.push('Au moins un rôle doit être sélectionné');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 