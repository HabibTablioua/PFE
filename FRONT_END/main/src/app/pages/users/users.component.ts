import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
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
import { TablerIconsModule } from 'angular-tabler-icons';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatTooltipModule,
    TablerIconsModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['select', 'id', 'firstname', 'lastname', 'email', 'status', 'roles', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  
  isLoading = false;
  searchTerm = '';
  selectedUsers: User[] = [];
  selectedRoleFilter = '';
  
  userForm: FormGroup;
  isDialogOpen = false;
  isEditMode = false;
  editingUserId: number | null = null;

  roles = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'USER', label: 'Utilisateur' },
    { value: 'MANAGER', label: 'Manager' }
  ];

  filterMode = 'all'; // 'all', 'firstname', 'lastname', 'email'
  showFilterPanel = false;
  filterRole = '';
  filterStatus = '';

  hidePassword = true;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roles: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    // Debug: Vérifier l'état d'authentification
    console.log('UsersComponent: Vérification de l\'authentification...');
    console.log('Token présent:', !!localStorage.getItem('token'));
    console.log('Utilisateur connecté:', this.authService.getCurrentUserValue());
    console.log('Est authentifié:', this.authService.isAuthenticated());
    
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        // Trier par ID croissant (plus petit en haut)
        users.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.showNotification('Erreur lors du chargement des utilisateurs', 'error');
        this.isLoading = false;
      }
    });
  }

  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }

  resetFilters() {
    this.filterRole = '';
    this.filterMode = 'all';
    this.searchTerm = '';
    this.filterStatus = '';
    this.applyFilter();
  }

  applyFilter(event?: Event): void {
    let filterValue = this.searchTerm.trim().toLowerCase();
    const selectedRole = this.filterRole;
    const selectedStatus = this.filterStatus;

    this.dataSource.filterPredicate = (data: User, filter: string) => {
      // Filtrage par rôle (tableau)
      if (selectedRole && (!data.roles || !data.roles.includes(selectedRole))) {
        return false;
      }
      // Filtrage par statut
      if (selectedStatus && data.status !== selectedStatus) {
        return false;
      }
      // Filtrage par mode
      switch (this.filterMode) {
        case 'firstname':
          return data.firstname.toLowerCase().includes(filter);
        case 'lastname':
          return data.lastname.toLowerCase().includes(filter);
        case 'email':
          return data.email.toLowerCase().includes(filter);
        default: // 'all'
          return (
            data.firstname.toLowerCase().includes(filter) ||
            data.lastname.toLowerCase().includes(filter) ||
            data.email.toLowerCase().includes(filter)
          );
      }
    };

    this.dataSource.filter = filterValue;
  }

  applyRoleFilter(): void {
    if (this.selectedRoleFilter) {
      this.dataSource.filterPredicate = (data: User, filter: string) => {
        return data.role === filter;
      };
      this.dataSource.filter = this.selectedRoleFilter;
    } else {
      this.dataSource.filterPredicate = (data: User, filter: string) => {
        return data.firstname.toLowerCase().includes(filter) ||
               data.lastname.toLowerCase().includes(filter) ||
               data.email.toLowerCase().includes(filter);
      };
      this.dataSource.filter = this.searchTerm;
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selectedUsers.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = [...this.dataSource.data];
    }
  }

  toggleUserSelection(user: User): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  isUserSelected(user: User): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  openAddUserDialog(): void {
    this.isEditMode = false;
    this.editingUserId = null;
    this.userForm.reset();
    this.userForm.patchValue({
      roles: [],
      password: ''
    });
    this.isDialogOpen = true;
  }

  openEditUserDialog(user: User): void {
    this.isEditMode = true;
    this.editingUserId = user.id!;
    this.userForm.patchValue({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      roles: user.roles || []
    });
    this.isDialogOpen = true;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      // Validation côté client
      const validation = this.userService.validateUser(userData);
      if (!validation.isValid) {
        this.showNotification(validation.errors.join(', '), 'error');
        return;
      }
      if (this.isEditMode && this.editingUserId) {
        // Mode édition - on n'envoie plus le mot de passe
        this.userService.updateUser(this.editingUserId, userData).subscribe({
          next: () => {
            this.showNotification('Utilisateur modifié avec succès', 'success');
            this.closeDialog();
            this.loadUsers();
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
            this.showNotification('Erreur lors de la modification de l\'utilisateur', 'error');
          }
        });
      } else {
        // Mode création
        this.userService.createUser(userData).subscribe({
          next: () => {
            this.showNotification('Utilisateur créé avec succès', 'success');
            this.closeDialog();
            this.loadUsers();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.showNotification('Erreur lors de la création de l\'utilisateur', 'error');
          }
        });
      }
    }
  }

  deleteUser(user: User): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstname} ${user.lastname} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.id!).subscribe({
          next: () => {
            this.showNotification('Utilisateur supprimé avec succès', 'success');
            this.dataSource.data = this.dataSource.data.filter(u => u.id !== user.id);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
          }
        });
      }
    });
  }

  deleteSelectedUsers(): void {
    if (this.selectedUsers.length === 0) {
      this.showNotification('Aucun utilisateur sélectionné', 'warning');
      return;
    }

    const userNames = this.selectedUsers.map(u => `${u.firstname} ${u.lastname}`).join(', ');
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmer la suppression multiple',
      message: `Êtes-vous sûr de vouloir supprimer les utilisateurs suivants : ${userNames} ?`,
      confirmText: 'Supprimer tous',
      cancelText: 'Annuler',
      type: 'danger'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const userIds = this.selectedUsers.map(u => u.id!);
        this.userService.deleteMultipleUsers(userIds).subscribe({
          next: () => {
            this.showNotification(`${this.selectedUsers.length} utilisateur(s) supprimé(s) avec succès`, 'success');
            this.dataSource.data = this.dataSource.data.filter(u => u.id !== undefined && userIds.includes(u.id));
            this.selectedUsers = [];
          },
          error: (error) => {
            console.error('Erreur lors de la suppression multiple:', error);
            this.showNotification('Erreur lors de la suppression des utilisateurs', 'error');
          }
        });
      }
    });
  }

  getRoleLabel(role: string): string {
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'warn';
      case 'MANAGER':
        return 'accent';
      default:
        return 'primary';
    }
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: `${type}-snackbar`
    });
  }

  generatePassword(): void {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    this.userForm.get('password')?.setValue(password);
    this.hidePassword = false; // Affiche le mot de passe généré
  }
} 