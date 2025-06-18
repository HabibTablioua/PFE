import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of, throwError } from 'rxjs';

import { UsersComponent } from './users.component';
import { UserService, User } from '../../services/user.service';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockUsers: User[] = [
    {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      role: 'ADMIN'
    },
    {
      id: 2,
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane.smith@example.com',
      role: 'USER'
    }
  ];

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUsers',
      'createUser',
      'updateUser',
      'deleteUser',
      'deleteMultipleUsers',
      'validateUser'
    ]);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        UsersComponent,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatTooltipModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load users on init', () => {
      userService.getUsers.and.returnValue(of(mockUsers));
      
      component.ngOnInit();
      
      expect(userService.getUsers).toHaveBeenCalled();
      expect(component.dataSource.data).toEqual(mockUsers);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error when loading users', () => {
      userService.getUsers.and.returnValue(throwError(() => new Error('API Error')));
      
      component.ngOnInit();
      
      expect(userService.getUsers).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Erreur lors du chargement des utilisateurs',
        'Fermer',
        jasmine.any(Object)
      );
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('loadUsers', () => {
    it('should load users successfully', () => {
      userService.getUsers.and.returnValue(of(mockUsers));
      
      component.loadUsers();
      
      expect(component.isLoading).toBeTrue();
      expect(userService.getUsers).toHaveBeenCalled();
    });
  });

  describe('applyFilter', () => {
    it('should filter data source', () => {
      component.dataSource.data = mockUsers;
      const event = { target: { value: 'john' } } as any;
      
      component.applyFilter(event);
      
      expect(component.searchTerm).toBe('john');
    });
  });

  describe('selection methods', () => {
    beforeEach(() => {
      component.dataSource.data = mockUsers;
    });

    it('should check if all users are selected', () => {
      component.selectedUsers = [...mockUsers];
      expect(component.isAllSelected()).toBeTrue();
    });

    it('should toggle master selection', () => {
      component.masterToggle();
      expect(component.selectedUsers).toEqual(mockUsers);
      
      component.masterToggle();
      expect(component.selectedUsers).toEqual([]);
    });

    it('should toggle individual user selection', () => {
      const user = mockUsers[0];
      
      component.toggleUserSelection(user);
      expect(component.selectedUsers).toContain(user);
      
      component.toggleUserSelection(user);
      expect(component.selectedUsers).not.toContain(user);
    });

    it('should check if user is selected', () => {
      const user = mockUsers[0];
      component.selectedUsers = [user];
      
      expect(component.isUserSelected(user)).toBeTrue();
      expect(component.isUserSelected(mockUsers[1])).toBeFalse();
    });
  });

  describe('dialog methods', () => {
    it('should open add user dialog', () => {
      component.openAddUserDialog();
      
      expect(component.isEditMode).toBeFalse();
      expect(component.editingUserId).toBeNull();
      expect(component.isDialogOpen).toBeTrue();
    });

    it('should open edit user dialog', () => {
      const user = mockUsers[0];
      
      component.openEditUserDialog(user);
      
      expect(component.isEditMode).toBeTrue();
      expect(component.editingUserId).toBe(user.id);
      expect(component.isDialogOpen).toBeTrue();
      expect(component.userForm.get('firstname')?.value).toBe(user.firstname);
    });

    it('should close dialog', () => {
      component.isDialogOpen = true;
      
      component.closeDialog();
      
      expect(component.isDialogOpen).toBeFalse();
    });
  });

  describe('saveUser', () => {
    beforeEach(() => {
      component.userForm.patchValue({
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password123',
        roles: ['USER']
      });
    });

    it('should create user successfully', () => {
      userService.validateUser.and.returnValue({ isValid: true, errors: [] });
      userService.createUser.and.returnValue(of(mockUsers[0]));
      
      component.saveUser();
      
      expect(userService.createUser).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Utilisateur créé avec succès',
        'Fermer',
        jasmine.any(Object)
      );
    });

    it('should update user successfully', () => {
      component.isEditMode = true;
      component.editingUserId = 1;
      userService.validateUser.and.returnValue({ isValid: true, errors: [] });
      userService.updateUser.and.returnValue(of(mockUsers[0]));
      
      component.saveUser();
      
      expect(userService.updateUser).toHaveBeenCalledWith(1, jasmine.any(Object));
    });

    it('should show validation errors', () => {
      userService.validateUser.and.returnValue({ 
        isValid: false, 
        errors: ['Email invalide'] 
      });
      
      component.saveUser();
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Email invalide',
        'Fermer',
        jasmine.any(Object)
      );
    });
  });

  describe('deleteUser', () => {
    it('should open confirmation dialog', () => {
      const user = mockUsers[0];
      const dialogRef = { afterClosed: () => of(false) };
      dialog.open.and.returnValue(dialogRef as any);
      
      component.deleteUser(user);
      
      expect(dialog.open).toHaveBeenCalledWith(
        ConfirmationDialogComponent,
        jasmine.any(Object)
      );
    });

    it('should delete user when confirmed', () => {
      const user = mockUsers[0];
      const dialogRef = { afterClosed: () => of(true) };
      dialog.open.and.returnValue(dialogRef as any);
      userService.deleteUser.and.returnValue(of(void 0));
      
      component.deleteUser(user);
      
      expect(userService.deleteUser).toHaveBeenCalledWith(user.id);
    });
  });

  describe('deleteSelectedUsers', () => {
    beforeEach(() => {
      component.selectedUsers = mockUsers;
    });

    it('should show warning when no users selected', () => {
      component.selectedUsers = [];
      
      component.deleteSelectedUsers();
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Aucun utilisateur sélectionné',
        'Fermer',
        jasmine.any(Object)
      );
    });

    it('should delete multiple users when confirmed', () => {
      const dialogRef = { afterClosed: () => of(true) };
      dialog.open.and.returnValue(dialogRef as any);
      userService.deleteMultipleUsers.and.returnValue(of(void 0));
      
      component.deleteSelectedUsers();
      
      expect(userService.deleteMultipleUsers).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('utility methods', () => {
    it('should get role label', () => {
      expect(component.getRoleLabel('ADMIN')).toBe('Administrateur');
      expect(component.getRoleLabel('USER')).toBe('Utilisateur');
      expect(component.getRoleLabel('UNKNOWN')).toBe('UNKNOWN');
    });

    it('should get role color', () => {
      expect(component.getRoleColor('ADMIN')).toBe('warn');
      expect(component.getRoleColor('MANAGER')).toBe('accent');
      expect(component.getRoleColor('USER')).toBe('primary');
    });

    it('should show notification', () => {
      component.showNotification('Test message', 'success');
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Test message',
        'Fermer',
        jasmine.any(Object)
      );
    });
  });
}); 