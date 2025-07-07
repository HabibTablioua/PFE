import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ResponseDetailDialogComponent } from './response-detail-dialog.component';

@Component({
  selector: 'app-iso-response',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTableModule, MatIconModule],
  templateUrl: './iso-response.component.html',
  styleUrls: ['./iso-response.component.css']
})
export class IsoResponseComponent implements OnInit {
  form: FormGroup;
  response: any = null;
  displayedColumns: string[] = ['id', 'mti', 'status', 'createdAt', 'actions'];
  allResponses: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private dialog: MatDialog) {
    this.form = this.fb.group({
      isoMessage: ['']
    });
  }

  ngOnInit() {
    this.loadAllResponses();
  }

  loadAllResponses() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    this.http.get<any[]>('http://localhost:8088/api/response/history', { headers })
      .subscribe(res => {
        this.allResponses = res;
      });
  }

  submit() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    this.http.post('http://localhost:8088/api/response-iso', this.form.value, { headers })
      .subscribe(res => {
        this.response = res;
        this.loadAllResponses();
      });
  }

  showDetails(element: any) {
    this.dialog.open(ResponseDetailDialogComponent, {
      data: element,
      width: '600px'
    });
  }

  onDeleteAllResponses() {
    if (confirm('Voulez-vous vraiment supprimer toutes les réponses ISO ?')) {
      const token = localStorage.getItem('token');
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      this.http.delete('http://localhost:8088/api/response/history', { headers })
        .subscribe({
          next: () => {
            alert('Toutes les réponses ISO ont été supprimées');
            this.loadAllResponses();
          },
          error: () => alert('Erreur lors de la suppression de toutes les réponses ISO')
        });
    }
  }
} 