import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-iso-form',
  templateUrl: './iso-form.component.html',
  styleUrls: ['./iso-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class IsoFormComponent {
  form: FormGroup;
  result: string | null = null;
  showForm = false;

  // Liste statique des champs ISO à afficher
  isoFields = [
    { id: '2', name: 'Primary Account Number', length: 19 },
    { id: '3', name: 'Processing Code', length: 6 },
    { id: '4', name: 'Amount, Transaction', length: 12 },
    { id: '11', name: 'System Trace Audit Number', length: 6 },
    { id: '12', name: 'Time, Local Transaction', length: 6 },
    { id: '13', name: 'Date, Local Transaction', length: 4 }
    // Ajoute d'autres champs si besoin
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    const group: any = { mti: '' };
    this.isoFields.forEach(field => group[field.id] = '');
    this.form = this.fb.group(group);
  }

  generate(format: 'ascii' | 'hex') {
    const { mti, ...fields } = this.form.value;
    // On ne garde que les champs remplis
    const filteredFields = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v)
    );
    this.http.post<{ message: string }>(
      `/packing/pack-${format}`,
      { mti, fields: filteredFields }
    ).subscribe(res => this.result = res.message);
  }
}
