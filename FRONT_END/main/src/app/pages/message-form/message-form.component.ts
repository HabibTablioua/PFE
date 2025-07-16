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
      background-color: #fafafa; /* bg-gray-50 equivalent */
      border-radius: 0.75rem; /* rounded-lg equivalent */
      padding: 1rem;
      font-family: 'monospace', 'Consolas', 'Courier New', monospace;
      font-size: 0.875rem; /* text-sm equivalent */
      white-space: pre-wrap; /* Preserve whitespace and wrap text */
      word-break: break-all;
      overflow-x: auto;
      max-height: 400px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); /* shadow equivalent */
      cursor: default;
      transition: all 300ms ease-in-out;
    }

    .generated-message:hover {
      box-shadow: 0 4px 10px rgba(0,0,0,0.15), 0 0 0 2px #6a11cb; /* ring-2 ring-blue-400 */
    }

    .copy-button {
      margin-left: 10px;
      flex-shrink: 0;
      transition: color 300ms ease-in-out;
    }

    .copy-button:hover {
      color: #2575fc; /* text-blue-600 equivalent */
    }

    .action-buttons {
      margin-top: 20px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    /* Styles pour le bouton Modifier/Retour - ml-2 pour Material Design */
    .ml-2 {
      margin-left: 8px; /* Correspond à ml-2 de Tailwind */
    }
  `]
})
export class MessageFormComponent implements OnInit {
  messageForm: FormGroup;
  showForm: boolean = true; // Contrôle l'affichage du formulaire ou du résultat
  generatedMessage: string = ''; // Stocke le message ISO généré
  fieldNames: { [key: string]: string } = {
    mti: 'Message Type Indicator',
    id1: 'Bitmap',
    id2: 'Primary Account Number',
    id3: 'Processing Code',
    id4: 'Amount, Transaction',
    id5: 'Amount, Settlement',
    id6: 'Amount, Cardholder Billing',
    id7: 'Transmission Date & Time',
    id8: 'Amount, Cardholder Billing Fee',
    id9: 'Conversion Rate, Settlement',
    id10: 'Conversion Rate, Cardholder Billing',
    id11: 'System Trace Audit Number',
    id12: 'Time, Local Transaction',
    id13: 'Date, Local Transaction',
    id14: 'Date, Expiration',
    id15: 'Date, Settlement',
    id16: 'Date, Conversion',
    id17: 'Date, Capture',
    id18: 'Merchant Category Code',
    id19: 'Acquiring Institution Country Code',
    id20: 'PAN Extended Country Code',
    id21: 'Forwarding Institution Country Code',
    id22: 'Point of Service Entry Mode',
    id23: 'Card Sequence Number',
    id24: 'Function Code',
    id25: 'Point of Service Condition Code',
    id26: 'POS Capture Code',
    id27: 'Authorizing Identification Response Length',
    id28: 'Amount, Transaction Fee',
    id29: 'Amount, Settlement Fee',
    id30: 'Amount, Transaction Processing Fee',
    id31: 'Amount, Settlement Processing Fee',
    id32: 'Acquiring Institution ID Code',
    id33: 'Forwarding Institution ID Code',
    id34: 'Primary Account Number, Extended',
    id35: 'Track 2 Data',
    id36: 'Track 3 Data',
    id37: 'Retrieval Reference Number',
    id38: 'Authorization Identification Response',
    id39: 'Response Code',
    id40: 'Service Restriction Code',
    id41: 'Card Acceptor Terminal Identification',
    id42: 'Card Acceptor Identification Code',
    id43: 'Card Acceptor Name/Location',
    id44: 'Additional Response Data',
    id45: 'Track 1 Data',
    id46: 'Additional Data - ISO',
    id47: 'Additional Data - National',
    id48: 'Additional Data - Private',
    id49: 'Currency Code, Transaction'
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
    'id1', 'id2', 'id3', 'id4', 'id5', 'id6', 'id7', 'id8', 'id9', 'id10',
    'id11', 'id12', 'id13', 'id14', 'id15', 'id16', 'id17', 'id18', 'id19', 'id20',
    'id21', 'id22', 'id23', 'id24', 'id25', 'id26', 'id27', 'id28', 'id29', 'id30',
    'id31', 'id32', 'id33', 'id34', 'id35', 'id36', 'id37', 'id38', 'id39', 'id40',
    'id41', 'id42', 'id43', 'id44', 'id45', 'id46', 'id47', 'id48', 'id49'
  ];

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar) {
    this.messageForm = this.fb.group({
      mti: ['', Validators.required], // Message Type Indicator (combobox)
      id1: [''], // Bitmap
      id2: [''], // Primary Account Number
      id3: [''], // Processing Code
      id4: [''], // Amount, Transaction
      id5: [''], // Amount, Settlement
      id6: [''], // Amount, Cardholder Billing
      id7: [''], // Transmission Date & Time
      id8: [''], // Amount, Cardholder Billing Fee
      id9: [''], // Conversion Rate, Settlement
      id10: [''], // Conversion Rate, Cardholder Billing
      id11: [''], // System Trace Audit Number
      id12: [''], // Time, Local Transaction
      id13: [''], // Date, Local Transaction
      id14: [''], // Date, Expiration
      id15: [''], // Date, Settlement
      id16: [''], // Date, Conversion
      id17: [''], // Date, Capture
      id18: [''], // Merchant Category Code
      id19: [''], // Acquiring Institution Country Code
      id20: [''], // PAN Extended Country Code
      id21: [''], // Forwarding Institution Country Code
      id22: [''], // Point of Service Entry Mode
      id23: [''], // Card Sequence Number
      id24: [''], // Function Code
      id25: [''], // Point of Service Condition Code
      id26: [''], // POS Capture Code
      id27: [''], // Authorizing Identification Response Length
      id28: [''], // Amount, Transaction Fee
      id29: [''], // Amount, Settlement Fee
      id30: [''], // Amount, Transaction Processing Fee
      id31: [''], // Amount, Settlement Processing Fee
      id32: [''], // Acquiring Institution ID Code
      id33: [''], // Forwarding Institution ID Code
      id34: [''], // Primary Account Number, Extended
      id35: [''], // Track 2 Data
      id36: [''], // Track 3 Data
      id37: [''], // Retrieval Reference Number
      id38: [''], // Authorization Identification Response
      id39: [''], // Response Code
      id40: [''], // Service Restriction Code
      id41: [''], // Card Acceptor Terminal Identification
      id42: [''], // Card Acceptor Identification Code
      id43: [''], // Card Acceptor Name/Location
      id44: [''], // Additional Response Data
      id45: [''], // Track 1 Data
      id46: [''], // Additional Data - ISO
      id47: [''], // Additional Data - National
      id48: [''], // Additional Data - Private
      id49: ['']  // Currency Code, Transaction
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
            fields[key.replace('id', '')] = fieldValue;
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
            fields[key.replace('id', '')] = fieldValue;
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
              patch['id' + key] = data.fields[key];
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
                values['id' + trimmedKey] = value.trim();
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