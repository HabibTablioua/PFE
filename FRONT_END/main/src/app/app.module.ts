import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogsMonitoringComponent } from './pages/logs-monitoring/logs-monitoring.component';
import { MaterialModule } from './material.module';
import { IncidentListComponent } from './components/incident-list/incident-list.component';
import { IncidentFormComponent } from './components/incident-form/incident-form.component';
import { IncidentEditDialogComponent } from './components/incident-edit-dialog/incident-edit-dialog.component';
import { IncidentDeleteDialogComponent } from './components/incident-delete-dialog/incident-delete-dialog.component';
import { AuthInterceptor } from './services/auth.interceptor';

@NgModule({
  declarations: [
    LogsMonitoringComponent,
    IncidentListComponent,
    IncidentFormComponent,
    IncidentEditDialogComponent,
    IncidentDeleteDialogComponent,
    // ... existing code ...
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    // ... existing code ...
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  // ... existing code ...
})
export class AppModule { } 