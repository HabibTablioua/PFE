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

  filterMode = 'all';
  showFilterPanel = false;
  filterRole = '';
  filterStatus = '';

  hidePassword = true;

  // Propriétés pour les statistiques
  totalUsers = 0;
  onlineUsers = 0;
  offlineUsers = 0;
  adminUsers = 0;

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
    console.log('UsersComponent: Vérification de l\'authentification...');
    console.log('Token présent:', !!localStorage.getItem('token'));
    console.log('Utilisateur connecté:', this.authService.getCurrentUserValue());
    console.log('Est authentifié:', this.authService.isAuthenticated());
    
    this.loadUsers();
    
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('🔄 Utilisateur connecté, mise à jour du statut...');
        this.updateUserStatus(user.email, 'online');
      } else {
        console.log('🔄 Utilisateur déconnecté, mise à jour du statut...');
        this.setAllUsersOffline();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.checkCurrentUserStatus();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    const users = this.dataSource.data;
    this.totalUsers = users.length;
    this.onlineUsers = users.filter(user => user.status === 'online').length;
    this.offlineUsers = users.filter(user => user.status === 'offline').length;
    this.adminUsers = users.filter(user => user.roles && user.roles.includes('ADMIN')).length;
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  getStatusColor(status: string): string {
    return status === 'online' ? 'primary' : 'warn';
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

  getRoleLabel(role: string): string {
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  viewUserDetails(user: User): void {
    console.log('Détails de l\'utilisateur:', user);
    this.snackBar.open(`Détails de ${user.firstname} ${user.lastname}`, 'Fermer', { duration: 3000 });
  }

  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }

  applyFilter(): void {
    let filteredData = this.dataSource.data;

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(user => {
        switch (this.filterMode) {
          case 'firstname':
            return user.firstname?.toLowerCase().includes(searchLower);
          case 'lastname':
            return user.lastname?.toLowerCase().includes(searchLower);
          case 'email':
            return user.email?.toLowerCase().includes(searchLower);
          default:
            return user.firstname?.toLowerCase().includes(searchLower) ||
                   user.lastname?.toLowerCase().includes(searchLower) ||
                   user.email?.toLowerCase().includes(searchLower);
        }
      });
    }

    if (this.filterStatus) {
      filteredData = filteredData.filter(user => user.status === this.filterStatus);
    }

    if (this.filterRole) {
      filteredData = filteredData.filter(user => 
        user.roles && user.roles.includes(this.filterRole)
      );
    }

    this.dataSource.data = filteredData;
    this.calculateStats();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.filterRole = '';
    this.filterMode = 'all';
    this.loadUsers();
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
      const validation = this.userService.validateUser(userData);
      if (!validation.isValid) {
        this.showNotification(validation.errors.join(', '), 'error');
        return;
      }
      if (this.isEditMode && this.editingUserId) {
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
    this.hidePassword = false;
  }

  downloadUsersPdf(): void {
    this.userService.exportUsersPdf().subscribe((blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `utilisateurs_${new Date().toISOString().slice(0,10)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.snackBar.open('PDF téléchargé avec succès !', 'Fermer', { duration: 3000 });
    });
  }

  downloadUsersExcel(): void {
    this.userService.exportUsersExcel().subscribe((blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `utilisateurs_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.snackBar.open('Excel téléchargé avec succès !', 'Fermer', { duration: 3000 });
    });
  }

  downloadUsersCsv(): void {
    this.userService.exportUsersCsv().subscribe((blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `utilisateurs_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.snackBar.open('CSV téléchargé avec succès !', 'Fermer', { duration: 3000 });
    });
  }

  private updateUserStatus(email: string, status: 'online' | 'offline'): void {
    const users = this.dataSource.data;
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
      users[userIndex].status = status;
      this.dataSource.data = [...users];
      this.calculateStats();
      console.log(`✅ Statut de ${email} mis à jour: ${status}`);
    }
  }

  private setAllUsersOffline(): void {
    const users = this.dataSource.data;
    users.forEach(user => {
      user.status = 'offline';
    });
    this.dataSource.data = [...users];
    this.calculateStats();
    console.log('✅ Tous les utilisateurs sont maintenant hors ligne');
  }

  private checkCurrentUserStatus(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      this.updateUserStatus(currentUser.email, 'online');
      
      const users = this.dataSource.data;
      users.forEach(user => {
        if (user.email !== currentUser.email) {
          user.status = 'offline';
        }
      });
      this.dataSource.data = [...users];
      this.calculateStats();
    } else {
      this.setAllUsersOffline();
    }
  }
} 