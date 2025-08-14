import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService,
    private router: Router,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs correctement', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.auth.login({
      email: this.f['email'].value!,
      password: this.f['password'].value!
    }).subscribe({
      next: (response) => {
        // Stocker le token et les informations utilisateur
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        if (response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          // Mettre à jour l'utilisateur courant via le service
          this.auth.updateCurrentUser(response.user);
        }
        
        // Déterminer la route de redirection selon le rôle
        let redirectRoute = '/message-form'; // Route par défaut pour tous les utilisateurs
        
        if (response.user && response.user.roles) {
          if (response.user.roles.includes('ADMIN')) {
            redirectRoute = '/dashboard'; // Les admins vont au dashboard
          } else {
            redirectRoute = '/message-form'; // Les utilisateurs normaux vont à la génération de messages
          }
        }
        
        const roleText = response.user?.roles?.includes('ADMIN') ? 'tableau de bord' : 'génération de messages ISO';
        
        this.snackBar.open(`Connexion réussie ! Redirection vers ${roleText}...`, 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        setTimeout(() => {
          this.router.navigate([redirectRoute]);
        }, 2000);
      },
      error: (err) => {
        let errorMessage = 'Une erreur est survenue lors de la connexion';
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}