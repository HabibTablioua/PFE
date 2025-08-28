import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-response-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatTableModule],
  templateUrl: './response-detail-dialog.component.html',
  styleUrls: ['./response-detail-dialog.component.css']
})
export class ResponseDetailDialogComponent {
  parsedFields: any = {};
  parsedDetails: any = {};
  isoFields: any[] = [];
  displayedColumns: string[] = ['field', 'name', 'value'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    // Log pour déboguer
    console.log('ResponseDetailDialog - Données reçues:', this.data);
    console.log('Status:', this.data.status);
    console.log('Cause:', this.data.cause);
    
    try {
      this.parsedFields = data.fields ? JSON.parse(data.fields) : {};
    } catch {
      this.parsedFields = data.fields;
    }
    // Correction : parser details si c'est un string JSON
    if (data.details) {
      if (typeof data.details === 'string') {
        try {
          this.parsedDetails = JSON.parse(data.details);
        } catch {
          this.parsedDetails = { raw: data.details };
        }
      } else {
        this.parsedDetails = data.details;
      }
    }
    
    // Convertir les champs ISO en tableau pour l'affichage
    this.isoFields = this.convertFieldsToTableData();
  }

  convertFieldsToTableData(): any[] {
    const fields = this.parsedFields;
    const tableData: any[] = [];
    
    if (fields && typeof fields === 'object') {
      Object.keys(fields).forEach(key => {
        // Exclure le champ 52 (PIN) de l'affichage
        if (key !== '52') {
          tableData.push({
            field: key,
            name: this.getFieldName(key),
            value: fields[key]
          });
        }
      });
    }
    
    // Trier par numéro de champ
    return tableData.sort((a, b) => parseInt(a.field) - parseInt(b.field));
  }

  getFieldName(fieldNumber: string): string {
    const fieldNames: { [key: string]: string } = {
      '0': 'Message Type Indicator',
      '1': 'Bitmap',
      '2': 'Primary Account Number',
      '3': 'Processing Code',
      '4': 'Amount, Transaction',
      '5': 'Amount, Reconciliation',
      '6': 'Amount, Cardholder Billing',
      '7': 'Transmission Date & Time',
      '8': 'Amount, Cardholder Billing Fee',
      '9': 'Conversion Rate, Reconciliation',
      '10': 'Conversion Rate, Cardholder Billing',
      '11': 'Systems Trace Audit Number',
      '12': 'Time, Local Transaction',
      '13': 'Date, Local Transaction',
      '14': 'Date, Expiration',
      '15': 'Date, Settlement',
      '16': 'Date, Conversion',
      '17': 'Date, Capture',
      '18': 'Merchant Type',
      '19': 'Acquiring Institution Country Code',
      '20': 'PAN Extended, Country Code',
      '21': 'Forwarding Institution Country Code',
      '22': 'Point of Service Entry Mode',
      '23': 'Application PAN Sequence Number',
      '24': 'Function Code',
      '25': 'Point of Service Condition Code',
      '26': 'Point of Service Capture Code',
      '27': 'Authorizing Identification Response Length',
      '28': 'Amount, Transaction Fee',
      '29': 'Amount, Settlement Fee',
      '30': 'Amount, Transaction Processing Fee',
      '31': 'Amount, Settlement Processing Fee',
      '32': 'Acquiring Institution Identification Code',
      '33': 'Forwarding Institution Identification Code',
      '34': 'Primary Account Number, Extended',
      '35': 'Track 2 Data',
      '36': 'Track 3 Data',
      '37': 'Retrieval Reference Number',
      '38': 'Authorization Identification Response',
      '39': 'Response Code',
      '40': 'Service Restriction Code',
      '41': 'Card Acceptor Terminal Identification',
      '42': 'Card Acceptor Identification Code',
      '43': 'Card Acceptor Name/Location',
      '44': 'Additional Response Data',
      '45': 'Track 1 Data',
      '46': 'Additional Data - ISO',
      '47': 'Additional Data - National',
      '48': 'Additional Data - Private',
      '49': 'Currency Code, Transaction',
      '60': 'Custom Text Field'
    };
    
    return fieldNames[fieldNumber] || `Champ ${fieldNumber}`;
  }

  detailsKeys(): string[] {
    return this.parsedDetails ? Object.keys(this.parsedDetails) : [];
  }
  
  getDetailValue(key: string): any {
    return this.parsedDetails ? this.parsedDetails[key] : '';
  }
  
  // Méthode pour déterminer le type d'alerte à afficher
  getAlertType(): 'success' | 'error' | 'none' {
    // Priorité 1: SUCCESS = alerte verte
    if (this.data.status === 'SUCCESS') {
      return 'success';
    }
    // Priorité 2: FAILED ou cause d'erreur = alerte rouge
    else if (this.data.status === 'FAILED' || this.data.cause) {
      return 'error';
    }
    // Aucune alerte si ni SUCCESS ni erreur
    return 'none';
  }
  
  // Méthode pour obtenir le message d'alerte approprié
  getAlertMessage(): string {
    // SUCCESS = message de succès
    if (this.data.status === 'SUCCESS') {
      return 'Transaction approuvée';
    }
    // FAILED = message d'échec
    else if (this.data.status === 'FAILED') {
      return 'Transaction échouée';
    }
    // Cause d'erreur = afficher la cause
    else if (this.data.cause) {
      return this.data.cause;
    }
    return '';
  }
  
  // Méthode pour extraire la valeur RRN des champs ISO
  getRRNValue(): string {
    if (this.parsedFields && this.parsedFields['37']) {
      return this.parsedFields['37'];
    }
    return '';
  }
  
  // Méthode pour vérifier si le RRN est disponible
  hasRRN(): boolean {
    return this.getRRNValue() !== '';
  }
  
  // Méthode pour transformer les clés d'affichage
  getDisplayKey(key: string): string {
    const keyMappings: { [key: string]: string } = {
      'isoCode': 'Response Code',
      'isoField': 'ISO Field',
      'pan': 'PAN',
      'reason': 'Raison',
      'action': 'Action'
    };
    
    return keyMappings[key] || key;
  }
  
  // Méthode pour formater les valeurs d'affichage
  getDisplayValue(key: string, value: any): string {
    if (key === 'pan' && value) {
      // Formater le PAN pour une meilleure lisibilité
      return value.toString().replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    if (key === 'isoCode' && value) {
      // Formater le Response Code avec un préfixe
      return `Code ${value}`;
    }
    
    return value;
  }
} 