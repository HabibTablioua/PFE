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
  selector: 'app-side-register',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent {
  options = this.settings.getOptions();
  error = '';
  success = '';

  constructor(
    private settings: CoreService, 
    private router: Router, 
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  form = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
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

    this.auth.register({
      firstname: this.f['firstname'].value!,
      lastname: this.f['lastname'].value!,
      email: this.f['email'].value!,
      password: this.f['password'].value!
    }).subscribe({
      next: (response) => {
        console.log('Inscription réussie !', {
          user: {
            firstname: this.f['firstname'].value,
            lastname: this.f['lastname'].value,
            email: this.f['email'].value
          },
          timestamp: new Date().toLocaleString()
        });

        this.snackBar.open('Inscription réussie ! Redirection vers la page de connexion...', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        setTimeout(() => {
          this.router.navigate(['/authentication/side-login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Erreur lors de l\'inscription:', err);
        let errorMessage = 'Une erreur est survenue lors de l\'inscription';
        if (err.status === 409) {
          errorMessage = "Cet email est déjà utilisé. Veuillez en choisir un autre.";
        } else if (err.status === 422) {
          errorMessage = "Tous les champs sont obligatoires.";
        } else if (err.error && err.error.message) {
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
