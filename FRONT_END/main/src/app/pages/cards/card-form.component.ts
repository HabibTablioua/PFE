import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { CardService, Card } from '../../services/card.service';
import { OperationsMappingService, OperationMapping } from '../../services/operations-mapping.service';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIconModule,
    MatRadioModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <!-- En-tête de la page -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <mat-icon>credit_card</mat-icon>
          </div>
          <div class="header-text">
            <h1>Nouvelle Carte</h1>
            <p>Créez une nouvelle carte bancaire avec toutes les informations nécessaires</p>
          </div>
        </div>
        <button mat-stroked-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Retour à la liste
        </button>
      </div>

      <!-- Formulaire de création de carte -->
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="cardForm" (ngSubmit)="onSubmit()">
            
            <!-- Section : Informations de base -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>info</mat-icon>
                Informations de base
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>PAN (Primary Account Number)*</mat-label>
                  <input matInput formControlName="pan" placeholder="1234567890123456" maxlength="16">
                  <mat-hint>16 chiffres requis - Doit respecter l'algorithme de Luhn</mat-hint>
                  <mat-error *ngIf="cardForm.get('pan')?.hasError('required')">Le PAN est requis</mat-error>
                  <mat-error *ngIf="cardForm.get('pan')?.hasError('pattern')">Le PAN doit contenir exactement 16 chiffres</mat-error>
                  <button mat-icon-button matSuffix type="button" (click)="generateNewPan()" matTooltip="Générer un PAN valide">
                    <mat-icon>refresh</mat-icon>
                  </button>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Nom du titulaire*</mat-label>
                  <input matInput formControlName="holderName" placeholder="Jean Dupont" maxlength="50">
                  <mat-error *ngIf="cardForm.get('holderName')?.hasError('required')">Le nom du titulaire est requis</mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Numéro de carte</mat-label>
                  <input matInput formControlName="cardNumber" placeholder="1234567890123456" maxlength="16">
                  <mat-hint>Optionnel - si vide, le PAN sera utilisé</mat-hint>
                  <mat-error *ngIf="cardForm.get('cardNumber')?.hasError('pattern')">Le numéro doit contenir exactement 16 chiffres</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Banque émettrice</mat-label>
                  <input matInput formControlName="issuer" placeholder="Banque Populaire" maxlength="30">
                </mat-form-field>
              </div>
            </div>

            <!-- Section : Informations de sécurité -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>security</mat-icon>
                Informations de sécurité
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>CVV</mat-label>
                  <input matInput formControlName="cvv" placeholder="123" maxlength="4" 
                         [type]="showCvv ? 'text' : 'password'">
                  <mat-hint>3 ou 4 chiffres de sécurité</mat-hint>
                  <mat-error *ngIf="cardForm.get('cvv')?.hasError('pattern')">Le CVV doit contenir 3 ou 4 chiffres</mat-error>
                  <button mat-icon-button matSuffix type="button" 
                          (click)="toggleCvvVisibility()" 
                          [attr.aria-label]="showCvv ? 'Masquer CVV' : 'Afficher CVV'"
                          matTooltip="{{ showCvv ? 'Masquer CVV' : 'Afficher CVV' }}">
                    <mat-icon>{{ showCvv ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>PIN</mat-label>
                  <input matInput formControlName="pin" placeholder="0000" maxlength="6" 
                         [type]="showPin ? 'text' : 'password'">
                  <mat-hint>4 à 6 chiffres du code secret</mat-hint>
                  <mat-error *ngIf="cardForm.get('pin')?.hasError('pattern')">Le PIN doit contenir 4 à 6 chiffres</mat-error>
                  <button mat-icon-button matSuffix type="button" 
                          (click)="togglePinVisibility()" 
                          [attr.aria-label]="showPin ? 'Masquer PIN' : 'Afficher PIN'"
                          matTooltip="{{ showPin ? 'Masquer PIN' : 'Afficher PIN' }}">
                    <mat-icon>{{ showPin ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </mat-form-field>
              </div>
            </div>

            <!-- Section : Type et expiration -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>schedule</mat-icon>
                Type et expiration
              </h3>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Type de carte*</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="DEBIT">Débit</mat-option>
                    <mat-option value="CREDIT">Crédit</mat-option>
                    <mat-option value="PREPAID">Prépayée</mat-option>
                  </mat-select>
                  <mat-error *ngIf="cardForm.get('type')?.hasError('required')">Le type de carte est requis</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Date d'expiration*</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="expiryDate" placeholder="MM/AAAA">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-error *ngIf="cardForm.get('expiryDate')?.hasError('required')">La date d'expiration est requise</mat-error>
                </mat-form-field>
              </div>
            </div>

            <!-- Section : Statut de la carte -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>settings</mat-icon>
                Statut de la carte
              </h3>
              
              <div class="status-grid">
                <mat-radio-button formControlName="status" value="ACTIVE" color="primary">
                  <div class="status-radio">
                    <mat-icon class="status-icon">check_circle</mat-icon>
                    <span>Active</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button formControlName="status" value="BLOCKED" color="warn">
                  <div class="status-radio">
                    <mat-icon class="status-icon">block</mat-icon>
                    <span>Bloquée</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button formControlName="status" value="EXPIRED" color="accent">
                  <div class="status-radio">
                    <mat-icon class="status-icon">schedule</mat-icon>
                    <span>Expirée</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button formControlName="status" value="SUSPENDED" color="warn">
                  <div class="status-radio">
                    <mat-icon class="status-icon">pause_circle</mat-icon>
                    <span>Suspendue</span>
                  </div>
                </mat-radio-button>
              </div>
            </div>

            <!-- Section : Opérations autorisées -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>settings_applications</mat-icon>
                Opérations autorisées
              </h3>
              
              <div class="operations-grid">
                <mat-checkbox formControlName="paymentCard" color="primary">
                  <div class="operation-checkbox">
                    <mat-icon class="operation-icon">credit_card</mat-icon>
                    <span>Paiement par carte</span>
                  </div>
                </mat-checkbox>
                <mat-checkbox formControlName="atmWithdrawal" color="primary">
                  <div class="operation-checkbox">
                    <mat-icon class="operation-icon">atm</mat-icon>
                    <span>Retrait DAB</span>
                  </div>
                </mat-checkbox>
                <mat-checkbox formControlName="bankTransfer" color="primary">
                  <div class="operation-checkbox">
                    <mat-icon class="operation-icon">swap_horiz</mat-icon>
                    <span>Virement bancaire</span>
                  </div>
                </mat-checkbox>
                <mat-checkbox formControlName="automaticDebit" color="primary">
                  <div class="operation-checkbox">
                    <mat-icon class="operation-icon">schedule</mat-icon>
                    <span>Prélèvement automatique</span>
                  </div>
                </mat-checkbox>
                <mat-checkbox formControlName="internetPayment" color="primary">
                  <div class="operation-checkbox">
                    <mat-icon class="operation-icon">wifi</mat-icon>
                    <span>Paiement Internet</span>
                  </div>
                </mat-checkbox>
                <mat-checkbox formControlName="foreignPayment" color="primary">
                  <div class="operation-checkbox">
                    <mat-icon class="operation-icon">flight</mat-icon>
                    <span>Paiement à l'étranger</span>
                  </div>
                </mat-checkbox>
                <mat-checkbox formControlName="premiumPayment" color="primary">
                  <div class="operation-checkbox">
                    <mat-icon class="operation-icon">star</mat-icon>
                    <span>Paiement premium</span>
                  </div>
                </mat-checkbox>
                <mat-checkbox formControlName="noRestriction" color="primary">
                  <div class="operation-checkbox">
                    <mat-icon class="operation-icon">check_circle</mat-icon>
                    <span>Aucune restriction</span>
                  </div>
                </mat-checkbox>
              </div>
            </div>

            <!-- Section : Alertes et restrictions -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>warning</mat-icon>
                Alertes et restrictions
              </h3>
              
              <div class="alert-grid">
                <mat-radio-button formControlName="alertStatus" value="NONE" color="primary">
                  <div class="alert-radio">
                    <mat-icon class="alert-icon">check_circle</mat-icon>
                    <span>Aucune alerte</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button formControlName="alertStatus" value="STOLEN" color="warn">
                  <div class="alert-radio">
                    <mat-icon class="alert-icon">theft</mat-icon>
                    <span>Carte volée</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button formControlName="alertStatus" value="LOST" color="warn">
                  <div class="alert-radio">
                    <mat-icon class="alert-icon">gps_off</mat-icon>
                    <span>Carte perdue</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button formControlName="alertStatus" value="BLACKLISTED" color="warn">
                  <div class="alert-radio">
                    <mat-icon class="alert-icon">block</mat-icon>
                    <span>Carte blacklistée</span>
                  </div>
                </mat-radio-button>
                <mat-radio-button formControlName="alertStatus" value="RESTRICTED" color="warn">
                  <div class="alert-radio">
                    <mat-icon class="alert-icon">lock</mat-icon>
                    <span>Carte restreinte</span>
                  </div>
                </mat-radio-button>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="goBack()" [disabled]="isSubmitting">
                <mat-icon>cancel</mat-icon>
                Annuler
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="cardForm.invalid || isSubmitting">
                <mat-icon *ngIf="!isSubmitting">save</mat-icon>
                <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
                <span *ngIf="isSubmitting">Création en cours...</span>
                <span *ngIf="!isSubmitting">Créer la carte</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-icon {
      background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
      border-radius: 50%;
      padding: 16px;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    }

    .header-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: white;
    }

    .header-text h1 {
      margin: 0 0 8px 0;
      color: #3730a3;
      font-size: 2rem;
      font-weight: 700;
    }

    .header-text p {
      margin: 0;
      color: #6366f1;
      font-size: 1rem;
    }

    .form-card {
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .form-section {
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 24px 0;
      color: #374151;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .section-title mat-icon {
      color: #3b82f6;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 20px;
    }

    .form-field {
      width: 100%;
    }

    .status-grid, .operations-grid, .alert-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .status-radio, .operation-checkbox, .alert-radio {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      background: white;
      border: 2px solid #e5e7eb;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .status-radio:hover, .operation-checkbox:hover, .alert-radio:hover {
      border-color: #3b82f6;
      background: #f0f9ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
    }

    .status-icon, .operation-icon, .alert-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .status-icon {
      color: #3b82f6;
    }

    .operation-icon {
      color: #10b981;
    }

    .alert-icon {
      color: #ef4444;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      gap: 24px;
      padding: 32px 0;
      border-top: 1px solid #e5e7eb;
      margin-top: 32px;
    }

    .form-actions button {
      min-width: 160px;
      height: 48px;
      font-weight: 600;
      border-radius: 12px;
    }

    .mat-mdc-raised-button.mat-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
    }

    .mat-mdc-raised-button.mat-primary:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }

    .mat-mdc-stroked-button {
      border: 2px solid #6b7280;
      color: #6b7280;
    }

    .mat-mdc-stroked-button:hover {
      border-color: #374151;
      color: #374151;
      background: #f9fafb;
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .status-grid, .operations-grid, .alert-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class CardFormComponent implements OnInit {
  cardForm: FormGroup;
  isSubmitting = false;
  availableOperations: OperationMapping[] = [];
  
  // Propriétés pour l'affichage des champs sensibles
  showCvv = false;
  showPin = false;

  constructor(
    private fb: FormBuilder,
    private cardService: CardService,
    private router: Router,
    private snackBar: MatSnackBar,
    private operationsMappingService: OperationsMappingService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.availableOperations = this.operationsMappingService.getAllOperations();
  }

  private initializeForm(): void {
    // Générer automatiquement un PAN valide pour les nouvelles cartes
    const generatedPan = this.generateValidPan();
    
    this.cardForm = this.fb.group({
      pan: [generatedPan, [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardNumber: ['', [Validators.pattern(/^\d{16}$/)]], // Numéro de carte optionnel
      holderName: ['', Validators.required],
      type: ['DEBIT', Validators.required],
      status: ['ACTIVE', Validators.required],
      expiryDate: ['', Validators.required],
      issuer: [''],
      cvv: ['', [Validators.pattern(/^\d{3,4}$/)]], // CVV 3 ou 4 chiffres
      pin: ['', [Validators.pattern(/^\d{4,6}$/)]], // PIN 4 à 6 chiffres
      paymentCard: [false],
      atmWithdrawal: [false],
      bankTransfer: [false],
      automaticDebit: [false],
      internetPayment: [false],
      foreignPayment: [false],
      premiumPayment: [false],
      noRestriction: [false],
      alertStatus: ['NONE', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.cardForm.valid) {
      this.isSubmitting = true;

      const cardData = this.cardForm.value;

      // Convertir les checkboxes en codes d'opérations
      const allowedOperations = this.convertCheckboxesToOperations(cardData);
      cardData.allowedOperations = allowedOperations;

      // Convertir le statut d'alerte en flags individuels
      this.convertAlertStatusToFlags(cardData);

      // Ajouter les champs manquants
      cardData.cardNumber = cardData.cardNumber || cardData.pan; // Si pas de cardNumber, utiliser le PAN
      cardData.cvv = cardData.cvv || '000'; // CVV par défaut si vide
      cardData.pin = cardData.pin || '0000'; // PIN par défaut si vide

      cardData.createdAt = new Date();
      cardData.updatedAt = new Date();

      console.log('📤 Données de la carte à envoyer:', cardData);

      this.cardService.createCard(cardData).subscribe({
        next: () => {
          this.snackBar.open('Carte créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/cards']);
        },
        error: (error: any) => {
          console.error('Erreur lors de la création:', error);
          this.snackBar.open('Erreur lors de la création de la carte', 'Fermer', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  /**
   * Convertit les checkboxes en codes d'opérations
   */
  private convertCheckboxesToOperations(cardData: any): string {
    const operations: string[] = [];
    
    if (cardData.paymentCard) operations.push('200000');
    if (cardData.atmWithdrawal) operations.push('310000');
    if (cardData.bankTransfer) operations.push('400000');
    if (cardData.automaticDebit) operations.push('500000');
    if (cardData.internetPayment) operations.push('600000');
    if (cardData.foreignPayment) operations.push('700000');
    if (cardData.premiumPayment) operations.push('800000');
    if (cardData.noRestriction) operations.push('999999');
    
    return operations.join(',');
  }

  /**
   * Convertit le statut d'alerte en flags individuels
   */
  private convertAlertStatusToFlags(cardData: any): void {
    const alertStatus = cardData.alertStatus;
    
    // Réinitialiser tous les flags
    cardData.stolen = false;
    cardData.lost = false;
    cardData.blacklisted = false;
    cardData.restricted = false;
    
    // Définir le flag approprié selon le statut sélectionné
    switch (alertStatus) {
      case 'STOLEN':
        cardData.stolen = true;
        break;
      case 'LOST':
        cardData.lost = true;
        break;
      case 'BLACKLISTED':
        cardData.blacklisted = true;
        break;
      case 'RESTRICTED':
        cardData.restricted = true;
        break;
      case 'NONE':
      default:
        // Aucun flag activé
        break;
    }
  }

  /**
   * Bascule l'affichage du CVV
   */
  toggleCvvVisibility(): void {
    this.showCvv = !this.showCvv;
  }

  /**
   * Bascule l'affichage du PIN
   */
  togglePinVisibility(): void {
    this.showPin = !this.showPin;
  }

  /**
   * Génère un nouveau PAN et le met à jour dans le formulaire
   */
  generateNewPan(): void {
    const newPan = this.generateValidPan();
    this.cardForm.patchValue({ pan: newPan });
    
    // Afficher un message de confirmation
    this.snackBar.open(`Nouveau PAN généré : ${newPan}`, 'Fermer', { duration: 3000 });
  }

  private generateValidPan(): string {
    // Générer 15 chiffres aléatoires
    let pan = '';
    for (let i = 0; i < 15; i++) {
      pan += Math.floor(Math.random() * 10);
    }
    
    // Calculer le chiffre de contrôle (Luhn)
    let sum = 0;
    let alternate = false;
    
    for (let i = pan.length - 1; i >= 0; i--) {
      let digit = parseInt(pan.charAt(i));
      
      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }
      
      sum += digit;
      alternate = !alternate;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return pan + checkDigit;
  }

  goBack(): void {
    this.router.navigate(['/cards']);
  }
}

