import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService, Account } from '../../services/account.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Operation {
  code: string;
  name: string;
  description: string;
  category: string;
}

@Component({
  selector: 'app-account-edit-dialog',
  templateUrl: './account-edit-dialog.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  styles: [`
    .dialog-container {
      padding: 24px;
      max-width: 800px;
      width: 100%;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-field {
      width: 100%;
    }

    .pan-field {
      grid-column: 1 / -1;
    }

    .pan-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .pan-status.valid {
      background-color: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .pan-status.invalid {
      background-color: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .pan-status.checking {
      background-color: #fefce8;
      color: #a16207;
      border: 1px solid #fde047;
    }

    .pan-status.exists {
      background-color: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .operations-section {
      margin-top: 24px;
    }

    .operations-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .operations-subtitle {
      color: #6b7280;
      margin-bottom: 16px;
      font-size: 0.875rem;
    }

    .operations-categories {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .category-section {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      background: #f9fafb;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .category-title {
      font-weight: 600;
      color: #374151;
      margin: 0;
    }

    .category-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-count {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .operations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 12px;
    }

    .operation-item {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      background: white;
      transition: all 0.2s ease;
    }

    .operation-item:hover {
      border-color: #d1d5db;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .operation-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .operation-name {
      font-weight: 500;
      color: #1f2937;
    }

    .operation-code {
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }

    .operation-description {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .selected-operations-summary {
      margin-top: 20px;
      padding: 16px;
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
    }

    .selected-operations-summary h4 {
      margin: 0 0 12px 0;
      color: #0c4a6e;
      font-size: 1rem;
    }

    .selected-codes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .code-badge {
      background: #0ea5e9;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-family: 'Courier New', monospace;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .loading-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .generate-pan-btn {
      color: #1976d2;
      transition: all 0.2s ease;
    }

    .generate-pan-btn:hover {
      color: #1565c0;
      transform: scale(1.1);
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .operations-grid {
        grid-template-columns: 1fr;
      }
      
      .category-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class AccountEditDialogComponent implements OnInit {
  accountForm!: FormGroup;
  loading = false;
  panChecking = false;
  panExists = false;
  panValid = false;
  originalPan = '';

  availableOperations: Operation[] = [
    // Opérations de paiement
    { code: '00', name: 'Autorisation', description: 'Autorisation de transaction', category: 'Paiement' },
    { code: '01', name: 'Autorisation financière', description: 'Autorisation avec débit immédiat', category: 'Paiement' },
    { code: '02', name: 'Autorisation partielle', description: 'Autorisation pour montant partiel', category: 'Paiement' },
    { code: '03', name: 'Débit', description: 'Débit de compte', category: 'Paiement' },
    { code: '04', name: 'Crédit', description: 'Crédit de compte', category: 'Paiement' },
    { code: '05', name: 'Crédit pour chargeback', description: 'Crédit suite à chargeback', category: 'Paiement' },
    { code: '06', name: 'Débit pour chargeback', description: 'Débit suite à chargeback', category: 'Paiement' },
    { code: '07', name: 'Annulation de débit', description: 'Annulation d\'un débit', category: 'Paiement' },
    { code: '08', name: 'Annulation de crédit', description: 'Annulation d\'un crédit', category: 'Paiement' },
    { code: '09', name: 'Correction de débit', description: 'Correction d\'un débit', category: 'Paiement' },
    { code: '10', name: 'Correction de crédit', description: 'Correction d\'un crédit', category: 'Paiement' },

    // Opérations de consultation
    { code: '20', name: 'Consultation solde', description: 'Consultation du solde du compte', category: 'Consultation' },
    { code: '21', name: 'Consultation historique', description: 'Consultation des transactions', category: 'Consultation' },
    { code: '22', name: 'Consultation limite', description: 'Consultation des limites de carte', category: 'Consultation' },
    { code: '23', name: 'Consultation statut', description: 'Consultation du statut du compte', category: 'Consultation' },

    // Opérations de gestion
    { code: '30', name: 'Activation carte', description: 'Activation d\'une carte', category: 'Gestion' },
    { code: '31', name: 'Désactivation carte', description: 'Désactivation d\'une carte', category: 'Gestion' },
    { code: '32', name: 'Blocage carte', description: 'Blocage temporaire de carte', category: 'Gestion' },
    { code: '33', name: 'Déblocage carte', description: 'Déblocage d\'une carte', category: 'Gestion' },
    { code: '34', name: 'Modification limite', description: 'Modification des limites', category: 'Gestion' },
    { code: '35', name: 'Modification PIN', description: 'Modification du code PIN', category: 'Gestion' },

    // Opérations de sécurité
    { code: '40', name: 'Vérification PIN', description: 'Vérification du code PIN', category: 'Sécurité' },
    { code: '41', name: 'Vérification signature', description: 'Vérification de signature', category: 'Sécurité' },
    { code: '42', name: 'Vérification CVV', description: 'Vérification du code CVV', category: 'Sécurité' },
    { code: '43', name: 'Détection fraude', description: 'Détection de fraude', category: 'Sécurité' },
    { code: '44', name: 'Blocage fraude', description: 'Blocage pour suspicion de fraude', category: 'Sécurité' },

    // Opérations administratives
    { code: '50', name: 'Création compte', description: 'Création d\'un nouveau compte', category: 'Administration' },
    { code: '51', name: 'Modification compte', description: 'Modification des données du compte', category: 'Administration' },
    { code: '52', name: 'Fermeture compte', description: 'Fermeture d\'un compte', category: 'Administration' },
    { code: '53', name: 'Suspension compte', description: 'Suspension temporaire du compte', category: 'Administration' },
    { code: '54', name: 'Réactivation compte', description: 'Réactivation d\'un compte suspendu', category: 'Administration' }
  ];

  selectedOperations: string[] = [];

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AccountEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { account: Account }
  ) {}

  ngOnInit(): void {
    console.log('AccountEditDialogComponent initialisé');
    this.initForm();
    this.setupPanValidation();
    this.loadAccountData();
  }

  initForm(): void {
    this.accountForm = this.fb.group({
      pan: ['', [
        Validators.required,
        Validators.pattern(/^\d{16}$/),
        this.luhnValidator.bind(this)
      ]],
      holderName: ['', [Validators.required, Validators.minLength(2)]],
      accountNumber: ['', [Validators.required, Validators.minLength(5)]],
      balance: [0, [Validators.required, Validators.min(0)]],
      currency: ['MAD', [Validators.required]],
      status: ['OPEN', [Validators.required]],
      type: ['CHECKING', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  loadAccountData(): void {
    const account = this.data.account;
    this.originalPan = account.pan;
    
    // Charger les données du compte
    this.accountForm.patchValue({
      pan: account.pan,
      holderName: account.holderName || '',
      accountNumber: account.accountNumber || '',
      balance: account.balance || 0,
      currency: account.currency || 'MAD',
      status: account.status || 'OPEN',
      type: account.type || 'CHECKING',
      email: account.email || ''
    });

    // Charger les opérations autorisées
    if (account.allowedOperations) {
      this.selectedOperations = account.allowedOperations.split(',').filter(op => op.trim() !== '');
    }

    console.log('Données du compte chargées:', account);
    console.log('Opérations sélectionnées:', this.selectedOperations);
  }

  setupPanValidation(): void {
    const panControl = this.accountForm.get('pan');
    if (panControl) {
      panControl.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(pan => {
          if (pan && pan.length === 16 && this.accountService.validateLuhn(pan)) {
            this.panChecking = true;
            this.panValid = true;
            // Vérifier si le PAN existe déjà (sauf si c'est le même)
            if (pan !== this.originalPan) {
              return this.accountService.checkPanExists(pan);
            } else {
              this.panExists = false;
              this.panChecking = false;
              return of(false);
            }
          } else {
            this.panValid = false;
            this.panExists = false;
            this.panChecking = false;
            return of(false);
          }
        })
      ).subscribe({
        next: (exists) => {
          this.panExists = exists;
          this.panChecking = false;
        },
        error: () => {
          this.panChecking = false;
          this.panExists = false;
        }
      });
    }
  }

  luhnValidator(control: AbstractControl): ValidationErrors | null {
    const pan = control.value;
    if (!pan) return null;
    
    if (pan.length !== 16) {
      return { invalidLength: true };
    }
    
    if (!this.accountService.validateLuhn(pan)) {
      return { invalidLuhn: true };
    }
    
    return null;
  }

  generateValidPan(): void {
    const generatedPan = this.accountService.generateValidPan();
    this.accountForm.patchValue({ pan: generatedPan });
  }

  toggleOperation(operationCode: string): void {
    console.log('Toggle operation:', operationCode);
    const index = this.selectedOperations.indexOf(operationCode);
    if (index > -1) {
      this.selectedOperations.splice(index, 1);
      console.log('Opération supprimée:', operationCode);
    } else {
      this.selectedOperations.push(operationCode);
      console.log('Opération ajoutée:', operationCode);
    }
    console.log('Opérations sélectionnées:', this.selectedOperations);
  }

  isOperationSelected(operationCode: string): boolean {
    return this.selectedOperations.includes(operationCode);
  }

  getOperationsByCategory(category: string): Operation[] {
    return this.availableOperations.filter(op => op.category === category);
  }

  getCategories(): string[] {
    return [...new Set(this.availableOperations.map(op => op.category))];
  }

  selectAllCategory(category: string): void {
    console.log('Sélectionner tout pour la catégorie:', category);
    const categoryOperations = this.getOperationsByCategory(category);
    categoryOperations.forEach(op => {
      if (!this.selectedOperations.includes(op.code)) {
        this.selectedOperations.push(op.code);
      }
    });
    console.log('Opérations sélectionnées après sélection complète:', this.selectedOperations);
  }

  deselectAllCategory(category: string): void {
    console.log('Désélectionner tout pour la catégorie:', category);
    const categoryOperations = this.getOperationsByCategory(category);
    categoryOperations.forEach(op => {
      const index = this.selectedOperations.indexOf(op.code);
      if (index > -1) {
        this.selectedOperations.splice(index, 1);
      }
    });
    console.log('Opérations sélectionnées après désélection complète:', this.selectedOperations);
  }

  isAllCategorySelected(category: string): boolean {
    const categoryOperations = this.getOperationsByCategory(category);
    return categoryOperations.every(op => this.selectedOperations.includes(op.code));
  }

  isSomeCategorySelected(category: string): boolean {
    const categoryOperations = this.getOperationsByCategory(category);
    return categoryOperations.some(op => this.selectedOperations.includes(op.code));
  }

  getSelectedCountForCategory(category: string): number {
    const categoryOperations = this.getOperationsByCategory(category);
    return categoryOperations.filter(op => this.selectedOperations.includes(op.code)).length;
  }

  getPanStatusMessage(): string {
    if (this.panChecking) return 'Vérification en cours...';
    if (this.panExists) return 'Ce PAN existe déjà';
    if (this.panValid) return 'PAN valide';
    return 'PAN invalide';
  }

  getPanStatusClass(): string {
    if (this.panChecking) return 'checking';
    if (this.panExists) return 'exists';
    if (this.panValid) return 'valid';
    return 'invalid';
  }

  onSubmit(): void {
    if (this.accountForm.valid && !this.panExists) {
      this.loading = true;
      const accountData: Account = {
        ...this.accountForm.value,
        allowedOperations: this.selectedOperations.join(','),
        updatedAt: new Date().toISOString()
      };

      console.log('Données du compte à mettre à jour:', accountData);

      this.accountService.updateAccount(this.originalPan, accountData).subscribe({
        next: (updatedAccount) => {
          console.log('Compte mis à jour avec succès:', updatedAccount);
          this.snackBar.open('Compte mis à jour avec succès', 'Fermer', { duration: 3000 });
          this.dialogRef.close(updatedAccount);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          let errorMessage = 'Erreur lors de la mise à jour du compte';
          
          if (error.status === 400) {
            errorMessage = 'Données invalides. Veuillez vérifier les informations saisies.';
          } else if (error.status === 404) {
            errorMessage = 'Compte non trouvé.';
          } else if (error.status === 401) {
            errorMessage = 'Erreur d\'authentification. Veuillez vous reconnecter.';
          } else if (error.status === 403) {
            errorMessage = 'Vous n\'avez pas les permissions pour modifier ce compte.';
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
          this.loading = false;
        }
      });
    } else {
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.accountForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.accountForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field.hasError('email')) {
      return 'Format d\'email invalide';
    }
    if (field.hasError('minlength')) {
      return `Minimum ${field.errors?.['minlength'].requiredLength} caractères`;
    }
    if (field.hasError('pattern')) {
      return 'Format invalide';
    }
    if (field.hasError('invalidLength')) {
      return 'Le PAN doit contenir exactement 16 chiffres';
    }
    if (field.hasError('invalidLuhn')) {
      return 'Le PAN ne respecte pas l\'algorithme de Luhn';
    }
    if (field.hasError('min')) {
      return 'La valeur doit être positive';
    }

    return 'Champ invalide';
  }
} 