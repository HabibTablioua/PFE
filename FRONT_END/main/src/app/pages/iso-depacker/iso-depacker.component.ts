import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-iso-depacker',
  templateUrl: './iso-depacker.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, MaterialModule, HttpClientModule, MatSnackBarModule, AppHeaderComponent, FormsModule],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate('0.5s ease-in-out')
      ])
    ])
  ],
  styles: [`
    .depacker-container {
      max-width: 900px;
      margin: 40px auto;
      padding: 30px;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      font-family: 'Inter', sans-serif;
    }

    .depack-button-section {
      text-align: center;
      margin-bottom: 30px;
    }

    .depack-textarea {
      width: 100%;
      min-height: 150px;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-family: 'monospace', 'Consolas', 'Courier New', monospace;
      font-size: 0.9rem;
      resize: vertical;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease-in-out;
    }

    .depack-textarea:focus {
      outline: none;
      border-color: #6a11cb;
      box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.2);
    }

    .result-area {
      background-color: #1a202c; /* bg-gray-900 */
      color: #a7f3d0; /* text-green-300 */
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: 'monospace', 'Consolas', 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      overflow-x: auto;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      justify-content: flex-end;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .depacker-container {
        margin: 20px;
        padding: 20px;
      }
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class IsoDepackerComponent implements OnInit {
  showDepackerArea: boolean = false;
  isoMessage: string = '';
  depackedResult: string = '';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit(): void { }

  toggleDepackerArea(): void {
    this.showDepackerArea = !this.showDepackerArea;
    if (!this.showDepackerArea) {
      this.resetDepacker();
    }
  }

  analyzeMessage(): void {
    if (!this.isoMessage) {
      this.snackBar.open('Veuillez coller un message ISO à analyser.', 'Fermer', { duration: 3000 });
      return;
    }

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'text/plain',
      'Authorization': `Bearer ${token}`
    };

    this.http.post('http://localhost:8088/api/depacking', this.isoMessage, { headers: headers, responseType: 'text' })
      .subscribe({
        next: (response: string) => {
          this.depackedResult = response;
          this.snackBar.open('Message analysé avec succès !', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de l\'analyse du message ISO:', error);
          this.snackBar.open('Erreur lors de l\'analyse du message.', 'Fermer', { duration: 5000 });
          this.depackedResult = 'Erreur: ' + (error.error || error.message || 'Impossible d\'analyser le message.');
        }
      });
  }

  copyResult(): void {
    navigator.clipboard.writeText(this.depackedResult).then(() => {
      this.snackBar.open('Résultat copié !', 'Fermer', { duration: 2000 });
    }).catch(err => {
      console.error('Erreur lors de la copie: ', err);
      this.snackBar.open('Impossible de copier le résultat.', 'Fermer', { duration: 3000 });
    });
  }

  resetDepacker(): void {
    this.isoMessage = '';
    this.depackedResult = '';
    this.snackBar.open('Champs réinitialisés.', 'Fermer', { duration: 2000 });
  }
} 