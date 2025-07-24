import { Component, OnInit } from '@angular/core';
import { LogsService } from 'src/app/services/logs.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogData } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DecodeUriPipe } from 'src/app/pipe/decode-uri.pipe';

@Component({
  selector: 'app-logs-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatTableModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatIconModule,
    DecodeUriPipe
  ],
  templateUrl: './logs-monitoring.component.html',
  styleUrls: ['./logs-monitoring.component.scss']
})
export class LogsMonitoringComponent implements OnInit {
  logs: any[] = [];
  allLogs: any[] = [];
  stats = { total: 0, success: 0, error: 0, failed: 0, successRate: 0 };
  keyword = '';
  startDate = '';
  endDate = '';
  level = '';
  page = 0;
  size = 20;
  total = 0;
  selectedLogs: any[] = [];
  showFilterPanel = false;
  role = '';
  filterBy = '';
  // showDbLogs = false; // plus besoin

  constructor(private logsService: LogsService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.fetchLogsFromDatabase();
  }

  private formatDate(date: string | Date): string | null {
    if (!date) return null;
    const d = new Date(date);
    // On s'assure de ne pas avoir de problème de fuseau horaire en prenant les composantes UTC
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  }

  fetchLogs() {
    const filters: { [key: string]: any } = {
      keyword: this.keyword,
      startDate: this.formatDate(this.startDate),
      endDate: this.formatDate(this.endDate),
      level: this.level,
      role: this.role,
      filterBy: this.filterBy,
    };

    // On ne garde que les filtres qui ont une valeur
    Object.keys(filters).forEach(key => {
      if (!filters[key]) {
        delete filters[key];
      }
    });

    this.logsService.getLogs(filters, this.page, this.size).subscribe((data: any) => {
      this.logs = data.logs ?? [];
      this.total = data.total ?? 0;
      this.updateStats();
    });
  }

  fetchLogsFromDatabase() {
    this.logsService.getLogsFromDatabase().subscribe((data: any[]) => {
      // Filtrage côté frontend
      let filtered = data;
      if (this.keyword) {
        const keyword = this.keyword.toLowerCase();
        filtered = filtered.filter(log => (log.message || '').toLowerCase().includes(keyword));
      }
      if (this.level) {
        filtered = filtered.filter(log => (log.level || '').toLowerCase() === this.level.toLowerCase());
      }
      if (this.startDate) {
        const start = new Date(this.startDate).getTime();
        filtered = filtered.filter(log => new Date(log.dateTime || log.date_time || log.date).getTime() >= start);
      }
      if (this.endDate) {
        const end = new Date(this.endDate).getTime();
        filtered = filtered.filter(log => new Date(log.dateTime || log.date_time || log.date).getTime() <= end);
      }
      this.total = filtered.length;
      const startIdx = this.page * this.size;
      const endIdx = startIdx + this.size;
      this.logs = filtered.slice(startIdx, endIdx);
      this.updateStats();
    });
  }

  applyFilters() {
    // Cette méthode peut être gardée si vous avez des filtres purement UI, sinon elle est vide
    // La logique de filtrage est maintenant côté serveur
  }

  filterLogs() {
    this.page = 0;
    this.fetchLogsFromDatabase();
  }

  updateStats() {
    this.stats.total = this.logs?.length ?? 0;
    this.stats.success = this.logs?.filter(l => l.level === 'SUCCESS').length ?? 0;
    this.stats.error = this.logs?.filter(l => l.level === 'ERROR').length ?? 0;
    this.stats.failed = this.logs?.filter(l => l.level === 'FAILED').length ?? 0;
    this.stats.successRate = this.stats.total ? Math.round((this.stats.success / this.stats.total) * 100) : 0;
  }

  export(type: string) {
    this.logsService.exportLogs(type, {
      keyword: this.keyword,
      startDate: this.startDate,
      endDate: this.endDate,
      level: this.level
    });
  }

  nextPage() {
    if ((this.page + 1) * this.size < this.total) {
      this.page++;
      this.fetchLogs();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.fetchLogs();
    }
  }

  onSizeChange() {
    this.page = 0;
    this.fetchLogs();
  }

  getTotalPages(): number {
    return this.total ? Math.ceil(this.total / this.size) : 1;
  }

  onPaginateChange(event: any) {
    this.size = event.pageSize;
    this.page = event.pageIndex;
    this.fetchLogsFromDatabase();
  }

  toggleDetails(index: number) {
    this.logs[index].showDetails = !this.logs[index].showDetails;
  }

  toggleSelect(log: any) {
    const idx = this.selectedLogs.findIndex(l => l.id === log.id);
    if (idx > -1) {
      this.selectedLogs.splice(idx, 1);
    } else {
      this.selectedLogs.push(log);
    }
  }

  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedLogs = [];
    } else {
      this.selectedLogs = [...this.logs];
    }
  }

  allSelected() {
    return this.selectedLogs.length === this.logs.length && this.logs.length > 0;
  }

  isSelected(log: any) {
    return this.selectedLogs.some(l => l.id === log.id);
  }

  confirmDeleteSelectedLogs() {
    if (this.selectedLogs.length === 0) return;
    if (confirm('Voulez-vous vraiment supprimer la sélection ?')) {
      this.deleteSelectedLogs();
    }
  }

  deleteSelectedLogs() {
    const ids = this.selectedLogs.map(log => log.id);
    this.logsService.deleteLogsBatch(ids).subscribe(() => {
      this.fetchLogs();
      this.selectedLogs = [];
      this.snackBar.open('Logs supprimés avec succès', 'Fermer', { duration: 2500 });
    });
  }

  confirmDeleteLog(log: any) {
    if (confirm('Voulez-vous vraiment supprimer ce log ?')) {
      this.deleteLog(log);
    }
  }

  deleteLog(log: any) {
    this.logsService.deleteLog(log.id).subscribe(() => {
      this.fetchLogs();
      this.selectedLogs = this.selectedLogs.filter(l => l.id !== log.id);
      this.snackBar.open('Log supprimé avec succès', 'Fermer', { duration: 2500 });
    });
  }

  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }

  resetFilters() {
    this.startDate = '';
    this.endDate = '';
    this.level = '';
    this.keyword = '';
    this.role = '';
    this.filterBy = '';
    this.filterLogs();
  }
}
