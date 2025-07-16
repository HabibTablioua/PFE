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
      max-width: 820px;
      min-height: 350px;
      margin: 40px auto;
      padding: 2.5rem 2rem 2rem 2rem;
      background: linear-gradient(120deg, #fffbe7 0%, #f8fafc 100%);
      border-radius: 2rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.10), 0 1.5px 6px rgba(33, 150, 243, 0.08);
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 2.5rem;
      animation: fadeInSlide 0.7s cubic-bezier(.4,0,.2,1);
    }
    @keyframes fadeInSlide {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: none; }
    }
    .depack-form-area {
      flex: 1 1 350px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.2rem;
      width: 100%;
    }
    .iso-textarea-wrapper {
      position: relative;
      width: 100%;
      min-width: 260px;
      max-width: 440px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .iso-textarea-icon {
      position: absolute;
      left: 1.1rem;
      top: 1.1rem;
      font-size: 1.7rem;
      color: #2196f3;
      pointer-events: none;
      z-index: 2;
      filter: drop-shadow(0 2px 4px rgba(33,150,243,0.10));
      transition: color 0.2s;
    }
    .depack-textarea {
      width: 100%;
      min-height: 180px;
      max-height: 240px;
      padding: 1.5rem 1.2rem 1.2rem 3.2rem;
      border: 2.5px solid #90caf9;
      border-radius: 1.5rem;
      font-family: 'Fira Mono', 'Consolas', 'Courier New', monospace;
      font-size: 1.12rem;
      background: linear-gradient(135deg, #fff 70%, #e3f2fd 100%);
      color: #22223b;
      box-shadow: 0 4px 18px rgba(33, 150, 243, 0.10);
      transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
      resize: vertical;
      font-style: normal;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #90caf9 #f8fafc;
    }
    .depack-textarea:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.13);
      background: linear-gradient(135deg, #e3f2fd 80%, #fff 100%);
    }
    .depack-textarea:hover {
      border-color: #42a5f5;
      box-shadow: 0 2px 12px rgba(33, 150, 243, 0.13);
    }
    .depack-textarea::placeholder {
      font-style: italic;
      color: #90a4ae;
      opacity: 1;
      font-size: 1.08em;
      letter-spacing: 0.5px;
    }
    .depack-textarea::-webkit-scrollbar {
      width: 7px;
      background: #f8fafc;
      border-radius: 1rem;
    }
    .depack-textarea::-webkit-scrollbar-thumb {
      background: #90caf9;
      border-radius: 1rem;
    }
    .mat-form-field-appearance-outline .mat-form-field-outline {
      color: #2196f3;
    }
    .action-buttons {
      display: flex;
      gap: 1.2rem;
      margin-top: 0.5rem;
      justify-content: center;
      width: 100%;
    }
    .action-buttons button {
      min-width: 130px;
      font-weight: 500;
      border-radius: 1.1rem;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
      transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .action-buttons button:hover {
      transform: scale(1.05);
    }
    .action-buttons .analyze-btn {
      background: #2196f3;
      color: #fff;
      box-shadow: 0 4px 16px rgba(33, 150, 243, 0.13);
      border: none;
    }
    .action-buttons .analyze-btn:hover {
      background: #1565c0;
      color: #fff;
    }
    .action-buttons .reset-btn {
      background: transparent;
      color: #2196f3;
      border: 2px solid #90caf9;
    }
    .action-buttons .reset-btn:hover {
      background: #e3f2fd;
      color: #1565c0;
    }
    .action-buttons .cancel-btn {
      background: #fff1f0;
      color: #e53935;
      border: 2px solid #ffcdd2;
    }
    .action-buttons .cancel-btn:hover {
      background: #ffcdd2;
      color: #b71c1c;
    }
    .result-area {
      background: linear-gradient(90deg, #fffbe7 60%, #f8fafc 100%);
      color: #22223b;
      padding: 22px 18px;
      border-radius: 1.25rem;
      margin-top: 18px;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: 'Fira Mono', 'Consolas', 'Courier New', monospace;
      font-size: 1.01rem;
      line-height: 1.7;
      box-shadow: 0 2px 12px rgba(33, 150, 243, 0.10);
      overflow-x: auto;
    }
    .result-area h3 {
      margin-top: 0;
      color: #2196f3;
      font-weight: 600;
    }
    @media (max-width: 900px) {
      .depacker-container {
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.2rem;
        min-height: unset;
      }
      .depack-form-area {
        width: 100%;
        gap: 0.8rem;
        align-items: stretch;
        justify-content: flex-start;
      }
      .iso-textarea-wrapper {
        justify-content: stretch;
      }
      .action-buttons {
        flex-direction: column;
        gap: 0.7rem;
        align-items: stretch;
      }
    }
  `]
})
export class IsoDepackerComponent implements OnInit {
  showDepackerArea: boolean = false;
  isoMessage: string = '';
  depackedResult: string = '';
  fields: { id: number, value: string }[] = [];
  fieldNames: { [key: number]: string } = {
    0: 'Message Type Indicator (MTI)',
    1: 'Bitmap',
    2: 'Primary Account Number',
    3: 'Processing Code',
    4: 'Amount, Transaction',
    5: 'Amount, Settlement',
    6: 'Amount, Cardholder Billing',
    7: 'Transmission Date & Time',
    8: 'Amount, Cardholder Billing Fee',
    9: 'Conversion Rate, Settlement',
    10: 'Conversion Rate, Cardholder Billing',
    11: 'System Trace Audit Number',
    12: 'Time, Local Transaction',
    13: 'Date, Local Transaction',
    14: 'Date, Expiration',
    15: 'Date, Settlement',
    16: 'Date, Conversion',
    17: 'Date, Capture',
    18: 'Merchant Category Code',
    19: 'Acquiring Institution Country Code',
    20: 'PAN Extended Country Code',
    21: 'Forwarding Institution Country Code',
    22: 'Point of Service Entry Mode',
    23: 'Card Sequence Number',
    24: 'Function Code',
    25: 'Point of Service Condition Code',
    26: 'POS Capture Code',
    27: 'Authorizing Identification Response Length',
    28: 'Amount, Transaction Fee',
    29: 'Amount, Settlement Fee',
    30: 'Amount, Transaction Processing Fee',
    31: 'Amount, Settlement Processing Fee',
    32: 'Acquiring Institution ID Code',
    33: 'Forwarding Institution ID Code',
    34: 'Primary Account Number, Extended',
    35: 'Track 2 Data',
    36: 'Track 3 Data',
    37: 'Retrieval Reference Number',
    38: 'Authorization Identification Response',
    39: 'Response Code',
    40: 'Service Restriction Code',
    41: 'Card Acceptor Terminal Identification',
    42: 'Card Acceptor Identification Code',
    43: 'Card Acceptor Name/Location',
    44: 'Additional Response Data',
    45: 'Track 1 Data',
    46: 'Additional Data - ISO',
    47: 'Additional Data - National',
    48: 'Additional Data - Private',
    49: 'Currency Code, Transaction'
  };

  fieldMeta: { [key: number]: { type: string, description: string } } = {
    2: { type: 'n..19', description: 'Numéro de carte (PAN) masqué' },
    3: { type: 'n6', description: 'Code de traitement' },
    4: { type: 'n12', description: 'Montant de la transaction' },
    7: { type: 'n10', description: 'Date et heure de transmission' },
    11: { type: 'n6', description: 'Numéro d’audit (STAN)' },
    12: { type: 'n6', description: 'Heure locale' },
    13: { type: 'n4', description: 'Date locale' },
    14: { type: 'n4', description: 'Date d’expiration' },
    35: { type: 'z..37', description: 'Track 2 Data (masqué)' },
    36: { type: 'z..104', description: 'Track 3 Data (masqué)' },
    37: { type: 'an12', description: 'Numéro de référence' },
    38: { type: 'an6', description: 'Code d’autorisation' },
    39: { type: 'an2', description: 'Code de réponse' },
    41: { type: 'ans8', description: 'ID terminal' },
    49: { type: 'a3', description: 'Code devise' },
    // ... Ajoute d'autres champs selon besoin ...
  };

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
    this.http.post<{id: number, value: string}[]>(
      'http://localhost:8088/api/depacking/download/json',
      this.isoMessage,
      { headers, responseType: 'json' as 'json' }
    ).subscribe({
      next: (fields) => {
        this.fields = fields;
        this.depackedResult = '';
        this.snackBar.open('Message analysé avec succès !', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        this.fields = [];
        if (error.status === 403 || error.status === 400) {
          this.depackedResult = "Le message saisi n'est pas un message ISO 8583 valide.";
        } else {
          this.depackedResult = 'Erreur: ' + (error.error || error.message || 'Impossible d\'analyser le message.');
        }
        this.snackBar.open('Erreur lors de l\'analyse du message.', 'Fermer', { duration: 5000 });
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
    this.fields = [];
    this.snackBar.open('Champs réinitialisés.', 'Fermer', { duration: 2000 });
  }

  getFieldName(id: number): string {
    return this.fieldNames[id] || `Champ ${id}`;
  }

  getFieldMeta(id: number): { type: string, description: string } {
    return this.fieldMeta[id] || { type: 'N/A', description: '' };
  }

  getValueLength(value: string): number {
    return value ? value.length : 0;
  }

  toHex(value: string): string {
    return value ? Array.from(value).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ') : '';
  }

  copyFieldValue(value: string): void {
    navigator.clipboard.writeText(value).then(() => {
      this.snackBar.open('Valeur copiée !', 'Fermer', { duration: 1500 });
    });
  }
} 