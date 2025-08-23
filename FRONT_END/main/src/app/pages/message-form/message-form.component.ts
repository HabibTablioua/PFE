import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-message-form',
  templateUrl: './message-form.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, HttpClientModule, MatSnackBarModule, AppHeaderComponent],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate('0.5s ease-in-out')
      ])
    ])
  ],
  styles: [`
    /* Header du formulaire */
    .form-header {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
    }

    .header-icon mat-icon {
      color: white;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-text h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .header-text p {
      margin: 0;
      color: #64748b;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 16px;
    }

    .import-btn {
      border-radius: 12px;
      padding: 12px 24px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .import-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }

    /* Sections de catégories */
    .category-section {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      margin-bottom: 32px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .category-section:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    }

    .category-section.mti-section {
      border: 1px solid #e2e8f0;
    }

    .category-header {
      color: white;
      padding: 24px 32px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .category-icon {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .category-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .category-title h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .category-title p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .category-content {
      padding: 32px;
      background: #f8fafc;
    }

    /* Boutons d'action */
    .action-buttons-section {
      background: white;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      margin-bottom: 32px;
      border: 1px solid #e2e8f0;
    }

    .action-buttons-container {
      display: flex;
      gap: 32px;
      justify-content: center;
      flex-wrap: wrap;
      padding: 20px 0;
    }

    .action-btn {
      border-radius: 20px;
      padding: 20px 40px;
      font-weight: 700;
      font-size: 18px;
      min-width: 280px;
      height: 72px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .action-btn:hover::before {
      left: 100%;
    }

    .action-btn:hover {
      transform: translateY(-4px) scale(1.02);
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
    }

    .action-btn.primary:hover {
      box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
    }

    .action-btn.accent {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
    }

    .action-btn.accent:hover {
      box-shadow: 0 12px 40px rgba(245, 158, 11, 0.4);
    }

    .action-btn.warn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
    }

    .action-btn.warn:hover {
      box-shadow: 0 12px 40px rgba(239, 68, 68, 0.4);
    }

    .action-btn mat-icon {
      margin-right: 12px;
      font-size: 24px;
      width: 24px;
      height: 24px;
      vertical-align: middle;
    }

    /* Styles existants pour les résultats */
    .result-container {
      margin-top: 20px;
      padding: 20px;
      border-radius: 8px;
      background-color: #f5f5f5;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .message-output-box {
      display: flex;
      align-items: flex-start;
      margin-top: 15px;
      position: relative;
    }

    .generated-message {
      flex-grow: 1;
      background-color: #fafafa;
      border-radius: 0.75rem;
      padding: 1rem;
      font-family: 'monospace', 'Consolas', 'Courier New', monospace;
      font-size: 0.875rem;
      white-space: pre-wrap;
      word-break: break-all;
      overflow-x: auto;
      max-height: 400px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      cursor: default;
      transition: all 300ms ease-in-out;
    }

    .generated-message:hover {
      box-shadow: 0 4px 10px rgba(0,0,0,0.15), 0 0 0 2px #6a11cb;
    }

    .copy-button {
      margin-left: 10px;
      flex-shrink: 0;
      transition: color 300ms ease-in-out;
    }

    .copy-button:hover {
      color: #2575fc;
    }

    .action-buttons {
      margin-top: 20px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .ml-2 {
      margin-left: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-header {
        flex-direction: column;
        text-align: center;
        padding: 24px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .category-content {
        padding: 20px;
      }

      .action-buttons-container {
        flex-direction: column;
        align-items: center;
      }

      .action-btn {
        min-width: 100%;
        max-width: 350px;
        height: 80px;
        font-size: 16px;
        padding: 18px 32px;
      }
    }

    /* Animations */
    .category-section {
      animation: slideInUp 0.6s ease forwards;
      opacity: 0;
      transform: translateY(30px);
    }

    .category-section:nth-child(1) { animation-delay: 0.1s; }
    .category-section:nth-child(2) { animation-delay: 0.2s; }
    .category-section:nth-child(3) { animation-delay: 0.3s; }
    .category-section:nth-child(4) { animation-delay: 0.4s; }
    .category-section:nth-child(5) { animation-delay: 0.5s; }
    .category-section:nth-child(6) { animation-delay: 0.6s; }
    .category-section:nth-child(7) { animation-delay: 0.7s; }

    @keyframes slideInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class MessageFormComponent implements OnInit {
  messageForm: FormGroup;
  showForm: boolean = true; // Contrôle l'affichage du formulaire ou du résultat
  generatedMessage: string = ''; // Stocke le message ISO généré
  fieldNames: { [key: string]: string } = {
    mti: 'Message Type Indicator',
    DE1: 'Bitmap',
    DE2: 'Primary Account Number',
    DE3: 'Processing Code',
    DE4: 'Amount, Transaction',
    DE5: 'Amount, Settlement',
    DE6: 'Amount, Cardholder Billing',
    DE7: 'Transmission Date & Time',
    DE8: 'Amount, Cardholder Billing Fee',
    DE9: 'Conversion Rate, Settlement',
    DE10: 'Conversion Rate, Cardholder Billing',
    DE11: 'System Trace Audit Number',
    DE12: 'Time, Local Transaction',
    DE13: 'Date, Local Transaction',
    DE14: 'Date, Expiration',
    DE15: 'Date, Settlement',
    DE16: 'Date, Conversion',
    DE17: 'Date, Capture',
    DE18: 'Merchant Category Code',
    DE19: 'Acquiring Institution Country Code',
    DE20: 'PAN Extended Country Code',
    DE21: 'Forwarding Institution Country Code',
    DE22: 'Point of Service Entry Mode',
    DE23: 'Card Sequence Number',
    DE24: 'Function Code',
    DE25: 'Point of Service Condition Code',
    DE26: 'POS Capture Code',
    DE27: 'Authorizing Identification Response Length',
    DE28: 'Amount, Transaction Fee',
    DE29: 'Amount, Settlement Fee',
    DE30: 'Amount, Transaction Processing Fee',
    DE31: 'Amount, Settlement Processing Fee',
    DE32: 'Acquiring Institution ID Code',
    DE33: 'Forwarding Institution ID Code',
    DE34: 'Primary Account Number, Extended',
    DE35: 'Track 2 Data',
    DE36: 'Track 3 Data',
    DE37: 'Retrieval Reference Number',
    DE38: 'Authorization Identification Response',
    DE39: 'Response Code',
    DE40: 'Service Restriction Code',
    DE41: 'Card Acceptor Terminal Identification',
    DE42: 'Card Acceptor Identification Code',
    DE43: 'Card Acceptor Name/Location',
    DE44: 'Additional Response Data',
    DE45: 'Track 1 Data',
    DE46: 'Additional Data - ISO',
    DE47: 'Additional Data - National',
    DE48: 'Additional Data - Private',
    DE49: 'Currency Code, Transaction'
  };

  mtiOptions = [
    { value: '0100', viewValue: '0100 - Demande de transaction (Generic)' },
    { value: '0200', viewValue: '0200 - Demande de transaction (achat, retrait)' },
    { value: '0201', viewValue: '0201 - Répétition de demande' },
    { value: '0210', viewValue: '0210 - Réponse à une demande' },
    { value: '0220', viewValue: '0220 - Avis d\'exécution' },
    { value: '0230', viewValue: '0230 - Réponse à l\'avis' },
    { value: '0240', viewValue: '0240 - Notification' },
    { value: '0250', viewValue: '0250 - Réponse à la notification' },
  ];

  // Définition de l'ordre des champs pour l'affichage
  orderedFieldKeys: string[] = [
    'DE1', 'DE2', 'DE3', 'DE4', 'DE5', 'DE6', 'DE7', 'DE8', 'DE9', 'DE10',
    'DE11', 'DE12', 'DE13', 'DE14', 'DE15', 'DE16', 'DE17', 'DE18', 'DE19', 'DE20',
    'DE21', 'DE22', 'DE23', 'DE24', 'DE25', 'DE26', 'DE27', 'DE28', 'DE29', 'DE30',
    'DE31', 'DE32', 'DE33', 'DE34', 'DE35', 'DE36', 'DE37', 'DE38', 'DE39', 'DE40',
    'DE41', 'DE42', 'DE43', 'DE44', 'DE45', 'DE46', 'DE47', 'DE48', 'DE49'
  ];

  // Nouvelle structure organisée par catégories
  fieldCategories = [
    {
      title: '🔐 Informations de Base',
      icon: 'settings',
      color: '#1e40af',
      fields: ['DE1', 'DE2', 'DE3', 'DE7', 'DE11', 'DE18', 'DE22', 'DE23', 'DE24', 'DE25', 'DE26', 'DE27']
    },
    {
      title: '💰 Montants et Frais',
      icon: 'attach_money',
      color: '#059669',
      fields: ['DE4', 'DE5', 'DE6', 'DE8', 'DE9', 'DE10', 'DE28', 'DE29', 'DE30', 'DE31', 'DE49']
    },
    {
      title: '📅 Dates et Heures',
      icon: 'schedule',
      color: '#d97706',
      fields: ['DE12', 'DE13', 'DE14', 'DE15', 'DE16', 'DE17']
    },
    {
      title: '🏦 Informations Institutionnelles',
      icon: 'account_balance',
      color: '#7c3aed',
      fields: ['DE19', 'DE20', 'DE21', 'DE32', 'DE33']
    },
    {
      title: '💳 Données de la Carte',
      icon: 'credit_card',
      color: '#dc2626',
      fields: ['DE34', 'DE35', 'DE36', 'DE45']
    },
    {
      title: '🏪 Informations du Commerce',
      icon: 'store',
      color: '#0891b2',
      fields: ['DE41', 'DE42', 'DE43']
    },
    {
      title: '📊 Données Supplémentaires',
      icon: 'data_usage',
      color: '#65a30d',
      fields: ['DE37', 'DE38', 'DE39', 'DE40', 'DE44', 'DE46', 'DE47', 'DE48']
    }
  ];

  // Méthode pour obtenir les champs d'une catégorie
  getFieldsByCategory(category: any): any[] {
    return category.fields.map((fieldKey: string) => ({
      key: fieldKey,
      name: this.getFieldName(fieldKey),
      control: this.messageForm.get(fieldKey)
    }));
  }

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar) {
    this.messageForm = this.fb.group({
      mti: ['', Validators.required], // Message Type Indicator (combobox)
      DE1: [''], // Bitmap
      DE2: [''], // Primary Account Number
      DE3: [''], // Processing Code
      DE4: [''], // Amount, Transaction
      DE5: [''], // Amount, Settlement
      DE6: [''], // Amount, Cardholder Billing
      DE7: [''], // Transmission Date & Time
      DE8: [''], // Amount, Cardholder Billing Fee
      DE9: [''], // Conversion Rate, Settlement
      DE10: [''], // Conversion Rate, Cardholder Billing
      DE11: [''], // System Trace Audit Number
      DE12: [''], // Time, Local Transaction
      DE13: [''], // Date, Local Transaction
      DE14: [''], // Date, Expiration
      DE15: [''], // Date, Settlement
      DE16: [''], // Date, Conversion
      DE17: [''], // Date, Capture
      DE18: [''], // Merchant Category Code
      DE19: [''], // Acquiring Institution Country Code
      DE20: [''], // PAN Extended Country Code
      DE21: [''], // Forwarding Institution Country Code
      DE22: [''], // Point of Service Entry Mode
      DE23: [''], // Card Sequence Number
      DE24: [''], // Function Code
      DE25: [''], // Point of Service Condition Code
      DE26: [''], // POS Capture Code
      DE27: [''], // Authorizing Identification Response Length
      DE28: [''], // Amount, Transaction Fee
      DE29: [''], // Amount, Settlement Fee
      DE30: [''], // Amount, Transaction Processing Fee
      DE31: [''], // Amount, Settlement Processing Fee
      DE32: [''], // Acquiring Institution ID Code
      DE33: [''], // Forwarding Institution ID Code
      DE34: [''], // Primary Account Number, Extended
      DE35: [''], // Track 2 Data
      DE36: [''], // Track 3 Data
      DE37: [''], // Retrieval Reference Number
      DE38: [''], // Authorization Identification Response
      DE39: [''], // Response Code
      DE40: [''], // Service Restriction Code
      DE41: [''], // Card Acceptor Terminal Identification
      DE42: [''], // Card Acceptor Identification Code
      DE43: [''], // Card Acceptor Name/Location
      DE44: [''], // Additional Response Data
      DE45: [''], // Track 1 Data
      DE46: [''], // Additional Data - ISO
      DE47: [''], // Additional Data - National
      DE48: [''], // Additional Data - Private
      DE49: ['']  // Currency Code, Transaction
    });
  }

  ngOnInit(): void {}

  generateMessage(): void {
    if (this.messageForm.valid) {
      const formValue = this.messageForm.value;
      const mti = formValue.mti;
      const fields: { [key: string]: string } = {};

      // Collect other fields dynamically, only if they are not empty
      for (const key in formValue) {
        if (formValue.hasOwnProperty(key) && key !== 'mti') {
          const fieldValue = formValue[key];
          if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
            fields[key.replace('DE', '')] = fieldValue;
          }
        }
      }

      const requestBody = {
        mti: mti,
        fields: fields
      };

      const token = localStorage.getItem('token'); // Changed from 'jwt_token' to 'token'

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      this.http.post('http://localhost:8088/api/packing/pack-ascii', requestBody, { headers: headers })
        .subscribe({
          next: (response: any) => {
            console.log('Message généré avec succès:', response);
            this.snackBar.open('Message généré avec succès!', 'Fermer', { duration: 3000 });
            this.generatedMessage = response.message; // Changé de 'packedMessage' à 'message'
            this.showForm = false; // Masquer le formulaire, afficher le résultat
          },
          error: (error) => {
            console.error('Erreur lors de la génération du message:', error);
            this.snackBar.open('Erreur lors de la génération du message.', 'Fermer', { duration: 5000 });
            // Gérer les erreurs, par exemple afficher un message à l'utilisateur
          }
        });
    } else {
      this.messageForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
      this.snackBar.open('Veuillez remplir tous les champs requis.', 'Fermer', { duration: 3000 });
    }
  }

  generateHexMessage(): void {
    if (this.messageForm.valid) {
      const formValue = this.messageForm.value;
      const mti = formValue.mti;
      const fields: { [key: string]: string } = {};

      // Collect other fields dynamically, only if they are not empty
      for (const key in formValue) {
        if (formValue.hasOwnProperty(key) && key !== 'mti') {
          const fieldValue = formValue[key];
          if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
            fields[key.replace('DE', '')] = fieldValue;
          }
        }
      }

      const requestBody = {
        mti: mti,
        fields: fields
      };

      const token = localStorage.getItem('token');

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      this.http.post('http://localhost:8088/api/packing/pack-hex', requestBody, { headers: headers })
        .subscribe({
          next: (response: any) => {
            console.log('Message HEX généré avec succès:', response);
            this.snackBar.open('Message HEX généré avec succès!', 'Fermer', { duration: 3000 });
            this.generatedMessage = response.message; // Assurez-vous que 'message' est la bonne clé
            this.showForm = false;
          },
          error: (error) => {
            console.error('Erreur lors de la génération du message HEX:', error);
            this.snackBar.open('Erreur lors de la génération du message HEX.', 'Fermer', { duration: 5000 });
          }
        });
    } else {
      this.messageForm.markAllAsTouched();
      this.snackBar.open('Veuillez remplir tous les champs requis.', 'Fermer', { duration: 3000 });
    }
  }

  getFieldName(key: string): string {
    return this.fieldNames[key] || key;
  }

  copyMessage(): void {
    navigator.clipboard.writeText(this.generatedMessage).then(() => {
      this.snackBar.open('Message copié dans le presse-papiers !', 'Fermer', { duration: 2000 });
    }).catch(err => {
      console.error('Erreur lors de la copie: ', err);
      this.snackBar.open('Échec de la copie du message.', 'Fermer', { duration: 2000 });
    });
  }

  resetForm(): void {
    this.messageForm.reset();
    this.showForm = true; // Afficher le formulaire
    this.generatedMessage = ''; // Effacer le message généré
  }

  editForm(): void {
    this.showForm = true;
    this.generatedMessage = '';
  }

  clearForm(): void {
    this.messageForm.reset();
    this.messageForm.get('mti')?.setValue(''); // Reset MTI explicitly as it has a required validator
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        try {
          // JSON
          const data = JSON.parse(reader.result as string);
          if (data.fields) {
            // Si le JSON a un objet fields, on adapte les clés
            const patch: any = { mti: data.mti };
            Object.keys(data.fields).forEach(key => {
              patch['DE' + key] = data.fields[key];
            });
            this.messageForm.patchValue(patch);
          } else {
            this.messageForm.patchValue(data);
          }
          this.snackBar.open('Champs importés avec succès !', 'Fermer', { duration: 2500 });
        } catch {
          // Texte clé=valeur
          const lines = (reader.result as string).split('\n');
          const values: any = {};
          lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
              const trimmedKey = key.trim();
              if (/^\d+$/.test(trimmedKey)) {
                values['DE' + trimmedKey] = value.trim();
              } else {
                values[trimmedKey] = value.trim();
              }
            }
          });
          this.messageForm.patchValue(values);
          this.snackBar.open('Champs importés avec succès !', 'Fermer', { duration: 2500 });
        }
      };
      reader.readAsText(file);
    }
  }
} 