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
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('0.6s cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ],
  styles: [`
    .depacker-container {
      max-width: 1000px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    }

    /* Section d'accueil */
    .depack-button-section {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .welcome-card {
      background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
      border-radius: 24px;
      padding: 48px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      max-width: 500px;
      width: 100%;
    }

    .welcome-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
    }

    .welcome-icon mat-icon {
      color: white;
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .welcome-title {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }

    .welcome-description {
      font-size: 16px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 32px 0;
    }

    .main-action-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 16px 32px;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
    }

    .main-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
    }

    /* Zone de formulaire */
    .depack-form-area {
      background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    /* En-tête du formulaire */
    .form-header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 16px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    }

    .header-icon mat-icon {
      color: white;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-text h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .header-text p {
      font-size: 16px;
      color: #64748b;
      margin: 0;
    }

    /* Zone de saisie */
    .input-section {
      margin-bottom: 32px;
    }

    .iso-textarea-wrapper {
      background: white;
      border-radius: 20px;
      padding: 24px;
      border: 2px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .iso-textarea-wrapper:hover {
      border-color: #3b82f6;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
    }

    .textarea-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .textarea-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 12px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .textarea-icon mat-icon {
      color: white;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .textarea-info h4 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 4px 0;
    }

    .textarea-info p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .depack-textarea {
      width: 100%;
      min-height: 200px;
      padding: 20px;
      border: none;
      border-radius: 16px;
      font-family: 'Fira Mono', 'Consolas', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      resize: vertical;
      transition: all 0.3s ease;
    }

    .depack-textarea:focus {
      outline: none;
      background: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .depack-textarea::placeholder {
      color: #94a3b8;
      font-style: italic;
    }

    .textarea-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }

    .char-count {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }

    .format-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #64748b;
    }

    .format-indicator mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #3b82f6;
    }

    /* Boutons d'action */
    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 32px;
    }

    .action-buttons button {
      padding: 14px 28px;
      border-radius: 16px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
      min-width: 140px;
    }

    .analyze-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border-radius: 999px;
      padding: 0.7em 2em;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5em;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
      border: none;
    }

    .analyze-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
    }

    .analyze-btn .mat-icon {
      color: white;
    }

    .reset-btn {
      background-color: #eff6ff;
      color: #1d4ed8;
      border-radius: 999px;
      padding: 0.7em 2em;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5em;
      box-shadow: none;
      transition: background 0.2s, color 0.2s;
      border: none;
    }

    .reset-btn:hover {
      background-color: #dbeafe;
      color: #1e40af;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .reset-btn .mat-icon {
      color: #1d4ed8;
    }

    .cancel-btn {
      background-color: #ffebee;
      color: #d32f2f;
      border-radius: 999px;
      padding: 0.7em 2em;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5em;
      box-shadow: none;
      transition: background 0.2s, color 0.2s;
      border: none;
    }

    .cancel-btn:hover {
      background-color: #ffcdd2;
      color: #b71c1c;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .cancel-btn .mat-icon {
      color: #d32f2f;
    }

    /* Section des résultats */
    .results-section {
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 32px;
      border: 1px solid #bbf7d0;
    }

    .results-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
    }

    .results-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 16px;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .results-icon mat-icon {
      color: white;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .results-title h3 {
      font-size: 20px;
      font-weight: 700;
      color: #065f46;
      margin: 0 0 4px 0;
    }

    .results-title p {
      font-size: 14px;
      color: #047857;
      margin: 0;
    }

    .result-content {
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid #d1fae5;
    }

    .generated-message {
      font-family: 'Fira Mono', 'Consolas', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.6;
      color: #1e293b;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .results-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
    }

    .copy-btn, .download-btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .copy-btn {
      background: #3b82f6;
      color: white;
    }

    .copy-btn:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
    }

    .download-btn {
      border: 2px solid #3b82f6;
      color: #3b82f6;
      background: white;
    }

    .download-btn:hover {
      background: #3b82f6;
      color: white;
      transform: translateY(-2px);
    }

    /* Section du tableau des champs */
    .fields-table-section {
      background: white;
      border-radius: 20px;
      padding: 32px;
      border: 1px solid #e2e8f0;
    }

    .table-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .table-header h3 {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .table-header p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }

    .fields-table {
      width: 100%;
      background: white;
    }

    .fields-table th {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      color: #1e293b;
      font-weight: 600;
      padding: 16px;
      text-align: left;
      border-bottom: 2px solid #e2e8f0;
    }

    .fields-table td {
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }

    .field-id {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }

    .field-name {
      font-weight: 500;
      color: #1e293b;
    }

    .field-length {
      background: #f1f5f9;
      color: #475569;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
    }

    .field-value {
      font-family: 'Fira Mono', 'Consolas', 'Courier New', monospace;
      font-size: 13px;
      color: #1e293b;
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 8px;
      display: inline-block;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-btn {
      background: #f1f5f9;
      color: #3b82f6;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: #3b82f6;
      color: white;
      transform: scale(1.1);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .depacker-container {
        padding: 0 16px;
        margin: 20px auto;
      }

      .welcome-card {
        padding: 32px 24px;
      }

      .depack-form-area {
        padding: 24px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
      }

      .action-buttons button {
        width: 100%;
        max-width: 300px;
      }

      .results-actions {
        flex-direction: column;
        align-items: center;
      }

      .results-actions button {
        width: 100%;
        max-width: 300px;
      }

      .fields-table {
        font-size: 14px;
      }

      .fields-table th,
      .fields-table td {
        padding: 12px 8px;
      }
    }
  `]
})
export class IsoDepackerComponent implements OnInit {
  showDepackerArea: boolean = false
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
    49: 'Currency Code, Transaction',
    50: 'Currency Code, Settlement',
    51: 'Currency Code, Cardholder Billing',
    52: 'Personal Identification Number (PIN) Data',
    53: 'Security Related Control Information',
    54: 'Additional Amounts',
    55: 'ICC System Related Data',
    56: 'Original Data Elements',
    57: 'Authorization Life Cycle Code',
    58: 'Authorizing Agent Institution ID',
    59: 'Additional Data - National',
    60: 'Reserved for National Use',
    61: 'Reserved for National Use',
    62: 'Reserved for National Use',
    63: 'Reserved for National Use',
    64: 'Message Authentication Code (MAC)',
    65: 'Extended Payment Code',
    66: 'Settlement Code',
    67: 'Extended Payment Data',
    68: 'Receiving Institution Country Code',
    69: 'Settlement Institution Country Code',
    70: 'Network Management Information Code',
    71: 'Message Number',
    72: 'Message Number Last',
    73: 'Date, Action',
    74: 'Credits, Number',
    75: 'Credits, Reversal Number',
    76: 'Debits, Number',
    77: 'Debits, Reversal Number',
    78: 'Transfer Number',
    79: 'Transfer, Reversal Number',
    80: 'Inquiries, Number',
    81: 'Authorizations, Number',
    82: 'Credits, Processing Fee Amount',
    83: 'Credits, Transaction Fee Amount',
    84: 'Debits, Processing Fee Amount',
    85: 'Debits, Transaction Fee Amount',
    86: 'Credits, Amount',
    87: 'Credits, Reversal Amount',
    88: 'Debits, Amount',
    89: 'Debits, Reversal Amount',
    90: 'Original Data Elements',
    91: 'File Update Code',
    92: 'File Security Code',
    93: 'Response Indicator',
    94: 'Service Indicator',
    95: 'Replacement Amounts',
    96: 'Message Security Code',
    97: 'Amount, Net Settlement',
    98: 'Payee',
    99: 'Settlement Institution ID Code',
    100: 'Receiving Institution ID Code',
    101: 'File Name',
    102: 'Account Identification 1',
    103: 'Account Identification 2',
    104: 'Transaction Description',
    105: 'Reserved for ISO Use',
    106: 'Reserved for ISO Use',
    107: 'Reserved for ISO Use',
    108: 'Reserved for ISO Use',
    109: 'Reserved for ISO Use',
    110: 'Reserved for ISO Use',
    111: 'Reserved for ISO Use',
    112: 'Reserved for National Use',
    113: 'Reserved for National Use',
    114: 'Reserved for National Use',
    115: 'Reserved for National Use',
    116: 'Reserved for National Use',
    117: 'Reserved for National Use',
    118: 'Reserved for National Use',
    119: 'Reserved for National Use',
    120: 'Reserved for National Use',
    121: 'Reserved for National Use',
    122: 'Reserved for National Use',
    123: 'Reserved for National Use',
    124: 'Reserved for National Use',
    125: 'Reserved for National Use',
    126: 'Reserved for National Use',
    127: 'Reserved for National Use',
    128: 'Message Authentication Code'
  };

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  toggleDepackerArea(): void {
    this.showDepackerArea = !this.showDepackerArea;
    if (!this.showDepackerArea) {
      this.resetDepacker();
    }
  }

  analyzeMessage(): void {
    if (!this.isoMessage.trim()) {
      this.snackBar.open('Veuillez saisir un message ISO à analyser.', 'Fermer', { duration: 3000 });
      return;
    }

    this.http.post('http://localhost:8089/depacking', this.isoMessage, { responseType: 'text' })
      .subscribe({
        next: (result) => {
          this.depackedResult = result;
          this.parseFields();
          this.snackBar.open('Message analysé avec succès !', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de l\'analyse:', error);
          this.snackBar.open('Erreur lors de l\'analyse du message ISO.', 'Fermer', { duration: 5000 });
        }
      });
  }

  resetDepacker(): void {
    this.isoMessage = '';
    this.depackedResult = '';
    this.fields = [];
  }

  copyResult(): void {
    navigator.clipboard.writeText(this.depackedResult).then(() => {
      this.snackBar.open('Résultat copié dans le presse-papiers !', 'Fermer', { duration: 2000 });
    });
  }

  copyFieldValue(value: string): void {
    navigator.clipboard.writeText(value).then(() => {
      this.snackBar.open('Valeur copiée dans le presse-papiers !', 'Fermer', { duration: 2000 });
    });
  }

  getFieldName(id: number): string {
    return this.fieldNames[id] || `Champ ${id}`;
  }

  getValueLength(value: string): number {
    return value ? value.length : 0;
  }

  private parseFields(): void {
    // Logique pour parser les champs à partir du résultat
    // Cette méthode peut être étendue selon vos besoins
    this.fields = [];
  }
} 