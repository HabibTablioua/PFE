import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AccountFormComponent } from './account-form.component';
import { AccountService } from '../../services/account.service';
import { MaterialModule } from '../../material.module';

describe('AccountFormComponent', () => {
  let component: AccountFormComponent;
  let fixture: ComponentFixture<AccountFormComponent>;
  let accountService: jasmine.SpyObj<AccountService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const accountServiceSpy = jasmine.createSpyObj('AccountService', [
      'createAccount', 'checkPanExists', 'validateLuhn', 'generateValidPan'
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule],
      declarations: [AccountFormComponent],
      providers: [
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    accountService = TestBed.inject(AccountService) as jasmine.SpyObj<AccountService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.accountForm).toBeTruthy();
    expect(component.accountForm.get('currency')?.value).toBe('MAD');
    expect(component.accountForm.get('status')?.value).toBe('OPEN');
    expect(component.accountForm.get('type')?.value).toBe('CURRENT');
  });

  it('should validate PAN with Luhn algorithm', () => {
    // PAN valide selon Luhn
    const validPan = '4532015112830366';
    accountService.validateLuhn.and.returnValue(true);
    
    component.accountForm.patchValue({ pan: validPan });
    expect(component.accountForm.get('pan')?.valid).toBe(true);
  });

  it('should reject invalid PAN', () => {
    // PAN invalide
    const invalidPan = '4532015112830367';
    accountService.validateLuhn.and.returnValue(false);
    
    component.accountForm.patchValue({ pan: invalidPan });
    expect(component.accountForm.get('pan')?.invalid).toBe(true);
  });

  it('should generate valid PAN', () => {
    const generatedPan = '4532015112830366';
    accountService.generateValidPan.and.returnValue(generatedPan);
    
    component.generateValidPan();
    
    expect(accountService.generateValidPan).toHaveBeenCalled();
    expect(component.accountForm.get('pan')?.value).toBe(generatedPan);
  });

  it('should create account successfully', () => {
    const mockAccount = {
      pan: '4532015112830366',
      accountNumber: 'ACC001',
      holderName: 'John Doe',
      balance: 1000,
      currency: 'MAD',
      status: 'OPEN',
      type: 'CURRENT',
      email: 'john@example.com'
    };

    accountService.createAccount.and.returnValue(of(mockAccount));
    component.accountForm.patchValue(mockAccount);
    
    component.onSubmit();
    
    expect(accountService.createAccount).toHaveBeenCalledWith(jasmine.objectContaining(mockAccount));
    expect(snackBar.open).toHaveBeenCalledWith('Compte créé avec succès !', 'Fermer', jasmine.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/accounts']);
  });

  it('should handle creation error', () => {
    const error = { status: 400 };
    accountService.createAccount.and.returnValue(throwError(() => error));
    
    component.accountForm.patchValue({
      pan: '4532015112830366',
      accountNumber: 'ACC001',
      holderName: 'John Doe',
      balance: 1000,
      currency: 'MAD',
      status: 'OPEN',
      type: 'CURRENT',
      email: 'john@example.com'
    });
    
    component.onSubmit();
    
    expect(snackBar.open).toHaveBeenCalledWith(
      'Le PAN existe déjà ou les données sont invalides',
      'Fermer',
      jasmine.any(Object)
    );
  });

  it('should validate required fields', () => {
    component.onSubmit();
    
    expect(component.accountForm.get('pan')?.invalid).toBe(true);
    expect(component.accountForm.get('accountNumber')?.invalid).toBe(true);
    expect(component.accountForm.get('holderName')?.invalid).toBe(true);
    expect(component.accountForm.get('email')?.invalid).toBe(true);
  });

  it('should navigate back on cancel', () => {
    component.onCancel();
    
    expect(router.navigate).toHaveBeenCalledWith(['/accounts']);
  });

  it('should show appropriate error messages', () => {
    const panControl = component.accountForm.get('pan');
    panControl?.setValue('123');
    panControl?.markAsTouched();
    
    expect(component.getErrorMessage('pan')).toContain('16 chiffres');
  });
}); 