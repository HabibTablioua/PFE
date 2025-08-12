import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
import { CardService, Card } from '../../services/card.service';
import { OperationsMappingService, OperationMapping } from '../../services/operations-mapping.service';

@Component({
  selector: 'app-card-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIconModule,
    MatRadioModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        {{ isEditMode ? 'Modifier la carte' : 'Nouvelle carte' }}
      </h2>

      <form [formGroup]="cardForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-grid">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>PAN*</mat-label>
                <input matInput formControlName="pan" placeholder="1234567890123456" maxlength="16">
                <mat-error *ngIf="cardForm.get('pan')?.hasError('required')">Le PAN est requis</mat-error>
                <mat-error *ngIf="cardForm.get('pan')?.hasError('pattern')">Le PAN doit contenir exactement 16 chiffres</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Nom du titulaire*</mat-label>
                <input matInput formControlName="holderName" placeholder="Jean Dupont" maxlength="50">
                <mat-error *ngIf="cardForm.get('holderName')?.hasError('required')">Le nom du titulaire est requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Type de carte*</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="DEBIT">Débit</mat-option>
                  <mat-option value="CREDIT">Crédit</mat-option>
                  <mat-option value="PREPAID">Prépayée</mat-option>
                </mat-select>
                <mat-error *ngIf="cardForm.get('type')?.hasError('required')">Le type de carte est requis</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Date d'expiration*</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="expiryDate" placeholder="MM/AAAA">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="cardForm.get('expiryDate')?.hasError('required')">La date d'expiration est requise</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Banque émettrice</mat-label>
                <input matInput formControlName="issuer" placeholder="Banque Populaire" maxlength="30">
              </mat-form-field>
            </div>

            <div class="operations-section">
              <h4>Opérations autorisées</h4>
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

            <div class="status-section">
              <h4>Statut de la carte</h4>
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

            <div class="flags-section">
              <h4>Alertes et restrictions</h4>
              <div class="flags-grid">
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
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close type="button">
            Annuler
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="cardForm.invalid || isSubmitting">
            <mat-icon *ngIf="!isSubmitting">save</mat-icon>
            <span *ngIf="isSubmitting">Enregistrement...</span>
            <span *ngIf="!isSubmitting">{{ isEditMode ? 'Mettre à jour' : 'Créer' }}</span>
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      min-width: 600px;
    }

    h2 {
      margin: 0;
      padding: 24px 24px 0 24px;
      color: #1f2937;
      font-weight: 600;
    }

    mat-dialog-content {
      padding: 24px;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-field {
      width: 100%;
      transition: all 0.3s ease;
    }

    .form-field:hover {
      transform: translateY(-2px);
    }

    .form-field .mat-mdc-form-field {
      transition: all 0.3s ease;
    }

    .form-field:hover .mat-mdc-form-field {
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
    }

    .form-field .mat-mdc-form-field-focus-overlay {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      opacity: 0.1;
      transition: all 0.3s ease;
    }

    .form-field:focus-within .mat-mdc-form-field-focus-overlay {
      opacity: 0.2;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .flags-section {
      grid-column: 1 / -1;
      margin-top: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%);
      border-radius: 12px;
      border: 1px solid #e9d5ff;
      box-shadow: 0 4px 15px rgba(147, 51, 234, 0.1);
      transition: all 0.3s ease;
    }

    .flags-section:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(147, 51, 234, 0.2);
      border-color: #c084fc;
    }

    .flags-section h4 {
      margin: 0 0 20px 0;
      color: #581c87;
      font-size: 1.1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .flags-section h4::before {
      content: "⚠️";
      font-size: 1.2rem;
    }

    .flags-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .flags-grid .mat-mdc-checkbox {
      transition: all 0.3s ease;
      padding: 12px 16px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e9d5ff;
    }

    .flags-grid .mat-mdc-checkbox:hover {
      transform: translateX(4px);
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border-color: #c084fc;
      box-shadow: 0 4px 15px rgba(147, 51, 234, 0.15);
    }

    .flags-grid .mat-mdc-checkbox.mat-mdc-checkbox-checked {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-color: #0ea5e9;
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.2);
    }

    .flags-grid .mat-mdc-checkbox.mat-mdc-checkbox-checked:hover {
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      transform: translateX(4px) scale(1.02);
    }

    .operations-section {
      grid-column: 1 / -1;
      margin-top: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    .operations-section:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: #d1d5db;
    }

    .operations-section h4 {
      margin: 0 0 20px 0;
      color: #374151;
      font-size: 1.1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .operations-section h4::before {
      content: "⚙️";
      font-size: 1.2rem;
    }

    .operations-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .operation-checkbox {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .operation-checkbox:hover {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-color: #3b82f6;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
    }

    .operation-checkbox.mat-mdc-checkbox-checked {
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      border-color: #3b82f6;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
    }

    .operation-checkbox.mat-mdc-checkbox-checked:hover {
      background: linear-gradient(135deg, #bae6fd 0%, #93c5fd 100%);
      transform: translateX(4px) scale(1.02);
    }

    .operation-icon {
      color: #3b82f6;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .status-section {
      grid-column: 1 / -1;
      margin-top: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    .status-section:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: #d1d5db;
    }

    .status-section h4 {
      margin: 0 0 20px 0;
      color: #374151;
      font-size: 1.1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-section h4::before {
      content: "⚙️";
      font-size: 1.2rem;
    }

    .status-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .status-radio {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .status-radio:hover {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-color: #3b82f6;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
    }

    .status-radio.mat-mdc-radio-button-checked {
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      border-color: #3b82f6;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
    }

    .status-radio.mat-mdc-radio-button-checked:hover {
      background: linear-gradient(135deg, #bae6fd 0%, #93c5fd 100%);
      transform: translateX(4px) scale(1.02);
    }

    .status-icon {
      color: #3b82f6;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline {
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .mat-mdc-form-field-appearance-outline .mat-mdc-form-field-outline-thick {
      border-color: #3b82f6;
      border-width: 2px;
    }

    .mat-mdc-form-field-appearance-outline:hover .mat-mdc-form-field-outline {
      border-color: #1d4ed8;
      border-width: 2px;
    }

    .mat-mdc-form-field-appearance-outline:focus-within .mat-mdc-form-field-outline {
      border-color: #1e40af;
      border-width: 3px;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .mat-mdc-form-field-label {
      color: #374151;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .mat-mdc-form-field:focus-within .mat-mdc-form-field-label {
      color: #1d4ed8;
      transform: scale(1.05);
    }

    .mat-mdc-input-element {
      color: #1f2937;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .mat-mdc-input-element:focus {
      color: #1e40af;
      font-weight: 600;
    }

    .mat-mdc-select-value {
      color: #1f2937;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .mat-mdc-select:focus .mat-mdc-select-value {
      color: #1e40af;
      font-weight: 600;
    }

    .mat-mdc-select-arrow {
      color: #6b7280;
      transition: all 0.3s ease;
    }

    .mat-mdc-select:hover .mat-mdc-select-arrow {
      color: #3b82f6;
      transform: scale(1.2);
    }

    .mat-mdc-datepicker-toggle {
      color: #6b7280;
      transition: all 0.3s ease;
    }

    .mat-mdc-datepicker-toggle:hover {
      color: #3b82f6;
      transform: scale(1.1);
    }

    .mat-mdc-checkbox .mdc-checkbox {
      transition: all 0.3s ease;
    }

    .mat-mdc-checkbox:hover .mdc-checkbox {
      transform: scale(1.1);
    }

    .mat-mdc-checkbox.mat-mdc-checkbox-checked .mdc-checkbox {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      border-color: #0ea5e9;
    }

    .mat-mdc-checkbox.mat-mdc-checkbox-checked:hover .mdc-checkbox {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      transform: scale(1.05);
    }

    mat-dialog-actions {
      padding: 24px;
      margin: 0;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-top: 1px solid #e2e8f0;
      border-radius: 0 0 16px 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      position: relative;
      transform: translateX(-20px);
    }

    .mat-mdc-button {
      transition: all 0.3s ease;
      border-radius: 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 120px;
    }

    .mat-mdc-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .mat-mdc-raised-button.mat-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border: none;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
      color: white !important;
      min-width: 140px;
      transform: translateX(-8px);
    }

    .mat-mdc-raised-button.mat-primary:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-3px) translateX(-8px);
      box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
      color: white !important;
    }

    .mat-mdc-raised-button.mat-primary:active {
      transform: translateY(-1px) translateX(-8px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
      color: white !important;
    }

    .mat-mdc-button:not(.mat-primary) {
      color: #6b7280;
      border: 1px solid #d1d5db;
      background: white;
      transform: translateX(8px);
    }

    .mat-mdc-button:not(.mat-primary):hover {
      color: #374151;
      border-color: #9ca3af;
      background: #f9fafb;
      transform: translateY(-2px) translateX(8px);
    }

    .mat-mdc-button .mat-icon {
      transition: all 0.3s ease;
    }

    .mat-mdc-button:hover .mat-icon {
      transform: scale(1.1);
    }

    .operation-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .operation-icon {
      color: #3b82f6;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .operation-text {
      flex: 1;
      font-weight: 500;
      color: #1f2937;
    }

    .operation-code {
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .mat-mdc-select-panel {
      max-height: 300px;
    }

    .mat-mdc-option {
      padding: 8px 16px;
    }

    .mat-mdc-option:hover {
      background: #f0f9ff;
    }

    .mat-mdc-option.mat-mdc-option-selected {
      background: #dbeafe;
    }

    .alert-radio {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .alert-radio:hover {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-color: #ef4444;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.1);
    }

    .alert-radio.mat-mdc-radio-button-checked {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border-color: #ef4444;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
    }

    .alert-radio.mat-mdc-radio-button-checked:hover {
      background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
      transform: translateX(4px) scale(1.02);
    }

    .alert-icon {
      color: #ef4444;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .alert-radio.mat-mdc-radio-button-checked .alert-icon {
      color: #dc2626;
    }
  `]
})
export class CardFormDialogComponent implements OnInit {
  cardForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  availableOperations: OperationMapping[] = [];

  constructor(
    private fb: FormBuilder,
    private cardService: CardService,
    private dialogRef: MatDialogRef<CardFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private operationsMappingService: OperationsMappingService
  ) {
    this.cardForm = this.fb.group({
      pan: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      holderName: ['', Validators.required],
      type: ['DEBIT', Validators.required],
      status: ['ACTIVE', Validators.required],
      expiryDate: ['', Validators.required],
      issuer: [''],
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

  ngOnInit(): void {
    if (this.data && this.data.pan) {
      this.isEditMode = true;
      this.populateForm(this.data);
    }
    
    this.availableOperations = this.operationsMappingService.getAllOperations();
  }

  populateForm(card: any): void {
    this.cardForm.patchValue({
      pan: card.pan,
      holderName: card.holderName || '',
      type: card.type || 'DEBIT',
      status: card.status || 'ACTIVE',
      expiryDate: card.expiryDate ? new Date(card.expiryDate) : null,
      issuer: card.issuer || '',
      alertStatus: this.convertFlagsToAlertStatus(card)
    });

    // Populate allowedOperations checkboxes
    if (card.allowedOperations) {
      const operations = card.allowedOperations.split(',').map((op: string) => op.trim());
      this.cardForm.patchValue({
        paymentCard: operations.includes('200000'),
        atmWithdrawal: operations.includes('310000'),
        bankTransfer: operations.includes('400000'),
        automaticDebit: operations.includes('500000'),
        internetPayment: operations.includes('600000'),
        foreignPayment: operations.includes('700000'),
        premiumPayment: operations.includes('800000'),
        noRestriction: operations.includes('999999')
      });
    }
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

      cardData.createdAt = new Date();
      cardData.updatedAt = new Date();

      if (this.isEditMode) {
        this.cardService.updateCard(cardData.pan, cardData).subscribe({
          next: () => {
            this.dialogRef.close(true);
            this.snackBar.open('Carte mise à jour avec succès', 'Fermer', { duration: 3000 });
          },
          error: (error: any) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.snackBar.open('Erreur lors de la mise à jour de la carte', 'Fermer', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      } else {
        this.cardService.createCard(cardData).subscribe({
          next: () => {
            this.dialogRef.close(true);
            this.snackBar.open('Carte créée avec succès', 'Fermer', { duration: 3000 });
          },
          error: (error: any) => {
            console.error('Erreur lors de la création:', error);
            this.snackBar.open('Erreur lors de la création de la carte', 'Fermer', { duration: 3000 });
          }
        });
      }
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
   * Convertit les flags d'alerte en statut d'alerte
   */
  private convertFlagsToAlertStatus(card: any): string {
    if (card.stolen) return 'STOLEN';
    if (card.lost) return 'LOST';
    if (card.blacklisted) return 'BLACKLISTED';
    if (card.restricted) return 'RESTRICTED';
    return 'NONE';
  }
} 