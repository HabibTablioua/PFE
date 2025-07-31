import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService, Account } from '../../services/account.service';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Operation {
  code: string;
  name: string;
  description: string;
  category: string;
}

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MaterialModule],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  styles: [`
    .account-form-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 32px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .form-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .form-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .form-subtitle {
      color: #6b7280;
      font-size: 1rem;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-field {
      width: 100%;
    }

    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
      transition: all 0.2s ease;
    }

    .checkbox-item:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .checkbox-item mat-checkbox {
      margin-right: 8px;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .generate-pan-btn {
      margin-left: 8px;
    }

    .pan-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
      font-size: 0.875rem;
    }

    .pan-status.valid {
      color: #059669;
    }

    .pan-status.invalid {
      color: #dc2626;
    }

    .pan-status.checking {
      color: #d97706;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .success-snackbar {
      background: #059669;
      color: white;
    }

    .error-snackbar {
      background: #dc2626;
      color: white;
    }

    .warning-snackbar {
      background: #d97706;
      color: white;
    }

    .operations-section {
      margin-top: 24px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .operations-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .operations-subtitle {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 20px;
    }

    .operations-categories {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .category-section {
      background: white;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e5e7eb;
    }

    .category-title {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f3f4f6;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f3f4f6;
    }

    .category-title {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin: 0;
      padding: 0;
      border: none;
    }

    .category-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-count {
      font-size: 0.8rem;
      color: #6b7280;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 500;
    }

    .category-actions mat-checkbox {
      font-size: 0.8rem;
    }

    .category-actions mat-checkbox ::ng-deep .mdc-checkbox {
      margin-right: 8px;
    }

    .operations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
    }

    .operation-item {
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .operation-item:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
      transform: translateY(-1px);
    }

    .operation-item mat-checkbox {
      width: 100%;
    }

    .operation-content {
      margin-left: 8px;
    }

    .operation-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.9rem;
      margin-bottom: 4px;
    }

    .operation-code {
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 4px;
    }

    .operation-description {
      font-size: 0.8rem;
      color: #6b7280;
      line-height: 1.3;
    }

    .selected-operations-summary {
      margin-top: 20px;
      padding: 16px;
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
    }

    .selected-operations-summary h4 {
      font-size: 0.9rem;
      font-weight: 600;
      color: #0c4a6e;
      margin-bottom: 12px;
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
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Courier New', monospace;
    }

    @media (max-width: 768px) {
      .operations-grid {
        grid-template-columns: 1fr;
      }

      .operation-item {
        padding: 10px;
      }
    }
  `]
})
export class AccountFormComponent implements OnInit {
  accountForm!: FormGroup;
  loading = false;
  panChecking = false;
  panExists = false;
  panValid = false;

  // Liste des opérations disponibles
  availableOperations: Operation[] = [
    // Opérations de retrait
    { code: '200000', name: 'Retrait ATM', description: 'Retrait aux distributeurs automatiques', category: 'Retrait' },
    { code: '201000', name: 'Retrait Banque', description: 'Retrait en agence bancaire', category: 'Retrait' },
    { code: '202000', name: 'Retrait International', description: 'Retrait à l\'étranger', category: 'Retrait' },
    
    // Opérations de paiement
    { code: '310000', name: 'Paiement Commerce', description: 'Paiement en magasin', category: 'Paiement' },
    { code: '311000', name: 'Paiement En ligne', description: 'Paiement sur internet', category: 'Paiement' },
    { code: '312000', name: 'Paiement Mobile', description: 'Paiement par mobile', category: 'Paiement' },
    { code: '313000', name: 'Paiement Contactless', description: 'Paiement sans contact', category: 'Paiement' },
    
    // Opérations de transfert
    { code: '400000', name: 'Transfert Interne', description: 'Transfert entre comptes', category: 'Transfert' },
    { code: '401000', name: 'Transfert Externe', description: 'Transfert vers autre banque', category: 'Transfert' },
    { code: '402000', name: 'Transfert International', description: 'Transfert international', category: 'Transfert' },
    
    // Opérations de consultation
    { code: '500000', name: 'Consultation Solde', description: 'Consultation du solde', category: 'Consultation' },
    { code: '501000', name: 'Consultation Mouvements', description: 'Consultation des mouvements', category: 'Consultation' },
    { code: '502000', name: 'Consultation RIB', description: 'Consultation du RIB', category: 'Consultation' },
    
    // Opérations spéciales
    { code: '600000', name: 'Changement PIN', description: 'Modification du code PIN', category: 'Sécurité' },
    { code: '601000', name: 'Blocage Carte', description: 'Blocage temporaire de la carte', category: 'Sécurité' },
    { code: '602000', name: 'Déblocage Carte', description: 'Déblocage de la carte', category: 'Sécurité' }
  ];

  // Opérations sélectionnées
  selectedOperations: string[] = [];

  currencyOptions = [
    { value: 'MAD', label: 'Dirham Marocain (MAD)' },
    { value: 'USD', label: 'Dollar US (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' }
  ];

  statusOptions = [
    { value: 'OPEN', label: 'Ouvert' },
    { value: 'CLOSED', label: 'Fermé' },
    { value: 'SUSPENDED', label: 'Suspendu' }
  ];

  typeOptions = [
    { value: 'CURRENT', label: 'Compte Courant' },
    { value: 'SAVINGS', label: 'Compte Épargne' },
    { value: 'BUSINESS', label: 'Compte Professionnel' }
  ];

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('AccountFormComponent initialisé - Formulaire de création de compte');
    this.initForm();
    this.setupPanValidation();
  }

  initForm(): void {
    this.accountForm = this.fb.group({
      pan: ['', [
        Validators.required, 
        Validators.pattern(/^\d{16}$/),
        this.luhnValidator.bind(this)
      ]],
      accountNumber: ['', [Validators.required, Validators.minLength(3)]],
      holderName: ['', [Validators.required, Validators.minLength(2)]],
      balance: [0, [Validators.required, Validators.min(0)]],
      currency: ['MAD', Validators.required],
      status: ['OPEN', Validators.required],
      type: ['CURRENT', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      stolen: [false],
      lost: [false],
      blacklisted: [false],
      restricted: [false]
    });
  }

  // Gérer la sélection/désélection d'une opération
  toggleOperation(operationCode: string): void {
    console.log('Toggle operation:', operationCode);
    const index = this.selectedOperations.indexOf(operationCode);
    if (index > -1) {
      this.selectedOperations.splice(index, 1);
      console.log('Opération désélectionnée:', operationCode);
    } else {
      this.selectedOperations.push(operationCode);
      console.log('Opération sélectionnée:', operationCode);
    }
    console.log('Opérations sélectionnées:', this.selectedOperations);
  }

  // Vérifier si une opération est sélectionnée
  isOperationSelected(operationCode: string): boolean {
    return this.selectedOperations.includes(operationCode);
  }

  // Obtenir les opérations par catégorie
  getOperationsByCategory(category: string): Operation[] {
    return this.availableOperations.filter(op => op.category === category);
  }

  // Obtenir toutes les catégories uniques
  getCategories(): string[] {
    return [...new Set(this.availableOperations.map(op => op.category))];
  }

  // Sélectionner toutes les opérations d'une catégorie
  selectAllCategory(category: string): void {
    console.log('Sélection de toutes les opérations de:', category);
    const categoryOperations = this.getOperationsByCategory(category);
    categoryOperations.forEach(op => {
      if (!this.selectedOperations.includes(op.code)) {
        this.selectedOperations.push(op.code);
        console.log('Ajouté:', op.code);
      }
    });
    console.log('Opérations sélectionnées après sélection en masse:', this.selectedOperations);
  }

  // Désélectionner toutes les opérations d'une catégorie
  deselectAllCategory(category: string): void {
    console.log('Désélection de toutes les opérations de:', category);
    const categoryOperations = this.getOperationsByCategory(category);
    categoryOperations.forEach(op => {
      const index = this.selectedOperations.indexOf(op.code);
      if (index > -1) {
        this.selectedOperations.splice(index, 1);
        console.log('Retiré:', op.code);
      }
    });
    console.log('Opérations sélectionnées après désélection en masse:', this.selectedOperations);
  }

  // Vérifier si toutes les opérations d'une catégorie sont sélectionnées
  isAllCategorySelected(category: string): boolean {
    const categoryOperations = this.getOperationsByCategory(category);
    return categoryOperations.every(op => this.selectedOperations.includes(op.code));
  }

  // Vérifier si au moins une opération d'une catégorie est sélectionnée
  isSomeCategorySelected(category: string): boolean {
    const categoryOperations = this.getOperationsByCategory(category);
    return categoryOperations.some(op => this.selectedOperations.includes(op.code));
  }

  // Obtenir le nombre d'opérations sélectionnées par catégorie
  getSelectedCountForCategory(category: string): number {
    const categoryOperations = this.getOperationsByCategory(category);
    return categoryOperations.filter(op => this.selectedOperations.includes(op.code)).length;
  }

  // Méthode de débogage pour vérifier l'état des sélections
  debugSelections(): void {
    console.log('=== DEBUG SÉLECTIONS ===');
    console.log('Opérations sélectionnées:', this.selectedOperations);
    this.getCategories().forEach(category => {
      const selected = this.getSelectedCountForCategory(category);
      const total = this.getOperationsByCategory(category).length;
      const allSelected = this.isAllCategorySelected(category);
      const someSelected = this.isSomeCategorySelected(category);
      console.log(`${category}: ${selected}/${total} sélectionnées, allSelected=${allSelected}, someSelected=${someSelected}`);
    });
    console.log('========================');
  }

  setupPanValidation(): void {
    const panControl = this.accountForm.get('pan');
    if (panControl) {
      panControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap(pan => {
            if (pan && pan.length === 16 && this.accountService.validateLuhn(pan)) {
              this.panChecking = true;
              this.panValid = true;
              return this.accountService.checkPanExists(pan);
            } else {
              this.panValid = false;
              this.panExists = false;
              return of(false);
            }
          })
        )
        .subscribe({
          next: (exists) => {
            this.panChecking = false;
            this.panExists = exists;
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
    
    if (!this.accountService.validateLuhn(pan)) {
      return { invalidLuhn: true };
    }
    
    return null;
  }

  generateValidPan(): void {
    const generatedPan = this.accountService.generateValidPan();
    this.accountForm.patchValue({ pan: generatedPan });
  }

  onSubmit(): void {
    if (this.accountForm.valid && !this.panExists) {
      this.loading = true;
      
      const accountData: Account = {
        ...this.accountForm.value,
        allowedOperations: this.selectedOperations.join(','),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Données du compte à créer:', accountData);

      this.accountService.createAccount(accountData).subscribe({
        next: (response) => {
          this.snackBar.open('Compte créé avec succès !', 'Fermer', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/accounts']);
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          let errorMessage = 'Erreur lors de la création du compte';
          
          if (error.status === 400) {
            errorMessage = 'Le PAN existe déjà ou les données sont invalides';
          } else if (error.status === 401) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter';
          } else if (error.status === 403) {
            errorMessage = 'Vous n\'avez pas les permissions pour créer un compte';
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      let errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      
      if (this.panExists) {
        errorMessage = 'Ce PAN existe déjà. Veuillez utiliser un autre numéro.';
      }
      
      this.snackBar.open(errorMessage, 'Fermer', { 
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/accounts']);
  }

  markFormGroupTouched(): void {
    Object.keys(this.accountForm.controls).forEach(key => {
      const control = this.accountForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.accountForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    
    if (control?.hasError('email')) {
      return 'Format d\'email invalide';
    }
    
    if (control?.hasError('pattern')) {
      if (controlName === 'pan') {
        return 'Le PAN doit contenir exactement 16 chiffres';
      }
    }
    
    if (control?.hasError('invalidLuhn')) {
      return 'Le PAN n\'est pas valide selon l\'algorithme de Luhn';
    }
    
    if (control?.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return `Minimum ${requiredLength} caractères requis`;
    }
    
    if (control?.hasError('min')) {
      return 'La valeur doit être positive';
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.accountForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getPanStatusMessage(): string {
    if (this.panChecking) {
      return 'Vérification en cours...';
    }
    
    if (!this.accountForm.get('pan')?.value) {
      return '';
    }
    
    if (!this.panValid) {
      return 'PAN invalide';
    }
    
    if (this.panExists) {
      return 'Ce PAN existe déjà';
    }
    
    return 'PAN valide et disponible';
  }

  getPanStatusClass(): string {
    if (this.panChecking) {
      return 'checking';
    }
    
    if (!this.accountForm.get('pan')?.value) {
      return '';
    }
    
    if (!this.panValid || this.panExists) {
      return 'invalid';
    }
    
    return 'valid';
  }
} 