import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Incident } from '../../models/incident.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-incident-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatOptionModule],
  templateUrl: './incident-form.component.html',
  styleUrls: ['./incident-form.component.css']
})
export class IncidentFormComponent implements OnInit {
  @Input() incident: Incident | null = null;
  @Output() submitIncident = new EventEmitter<Partial<Incident>>();

  form: FormGroup;
  statusOptions = [
    { value: 'NON_TRAITE', label: 'Non traité' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'RESOLU', label: 'Résolu' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['NON_TRAITE', Validators.required]
    });
  }

  ngOnInit() {
    if (this.incident) {
      this.form.patchValue({
        title: this.incident.title,
        description: this.incident.description,
        status: this.incident.status || 'NON_TRAITE'
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitIncident.emit(this.form.value);
    }
  }

  resetForm() {
    this.form.reset();
  }
} 