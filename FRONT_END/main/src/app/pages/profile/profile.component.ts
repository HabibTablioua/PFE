import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error = '';
  editMode = false;
  success = '';
  editUser: User | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.userService.getUserByToken().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du profil utilisateur';
        this.loading = false;
      }
    });
  }

  startEdit() {
    this.editMode = true;
    this.success = '';
    this.error = '';
    this.editUser = this.user ? { ...this.user } : null;
  }

  cancelEdit() {
    this.editMode = false;
    this.editUser = null;
    this.success = '';
    this.error = '';
  }

  saveEdit() {
    if (!this.editUser || !this.user) return;
    this.loading = true;
    this.userService.updateUser(this.user.id!, {
      firstname: this.editUser.firstname,
      lastname: this.editUser.lastname,
      email: this.editUser.email
    }).subscribe({
      next: (updated) => {
        this.user = updated;
        this.editMode = false;
        this.editUser = null;
        this.success = 'Profil mis à jour avec succès';
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour du profil';
        this.loading = false;
      }
    });
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/authentication/login']);
  }
  /**
   * Valide le format d'un email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Vérifie si l'utilisateur est l'admin par défaut
   */
  isAdminUser(): boolean {
    return this.user?.email === 'admin@gmail.com';
  }
}
