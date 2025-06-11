import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-message-form',
  templateUrl: './message-form.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule]
})
export class MessageFormComponent implements OnInit {
  messageForm: FormGroup;
  fieldNames: { [key: string]: string } = {
    id0: 'Message Type Indicator',
    id1: 'Bitmap',
    id2: 'Primary Account Number',
    id3: 'Processing Code',
    id4: 'Amount, Transaction',
    id5: 'Amount, Settlement',
    id6: 'Amount, Cardholder Billing',
    id7: 'Transmission Date & Time',
    id8: 'Amount, Cardholder Billing Fee',
    id9: 'Conversion Rate, Settlement',
    id10: 'Conversion Rate, Cardholder Billing',
    id11: 'System Trace Audit Number',
    id12: 'Time, Local Transaction',
    id13: 'Date, Local Transaction',
    id14: 'Date, Expiration',
    id15: 'Date, Settlement',
    id16: 'Date, Conversion',
    id17: 'Date, Capture',
    id18: 'Merchant Category Code',
    id19: 'Acquiring Institution Country Code',
    id20: 'PAN Extended Country Code',
    id21: 'Forwarding Institution Country Code',
    id22: 'Point of Service Entry Mode',
    id23: 'Card Sequence Number',
    id24: 'Function Code',
    id25: 'Point of Service Condition Code',
    id26: 'POS Capture Code',
    id27: 'Authorizing Identification Response Length',
    id28: 'Amount, Transaction Fee',
    id29: 'Amount, Settlement Fee',
    id30: 'Amount, Transaction Processing Fee',
    id31: 'Amount, Settlement Processing Fee',
    id32: 'Acquiring Institution ID Code',
    id33: 'Forwarding Institution ID Code',
    id34: 'Primary Account Number, Extended',
    id35: 'Track 2 Data',
    id36: 'Track 3 Data',
    id37: 'Retrieval Reference Number',
    id38: 'Authorization Identification Response',
    id39: 'Response Code',
    id40: 'Service Restriction Code',
    id41: 'Card Acceptor Terminal Identification',
    id42: 'Card Acceptor Identification Code',
    id43: 'Card Acceptor Name/Location',
    id44: 'Additional Response Data',
    id45: 'Track 1 Data',
    id46: 'Additional Data - ISO',
    id47: 'Additional Data - National',
    id48: 'Additional Data - Private',
    id49: 'Currency Code, Transaction'
  };

  constructor(private fb: FormBuilder) {
    this.messageForm = this.fb.group({
      id0: [''], // Message Type Indicator
      id1: [''], // Bitmap
      id2: [''], // Primary Account Number
      id3: [''], // Processing Code
      id4: [''], // Amount, Transaction
      id5: [''], // Amount, Settlement
      id6: [''], // Amount, Cardholder Billing
      id7: [''], // Transmission Date & Time
      id8: [''], // Amount, Cardholder Billing Fee
      id9: [''], // Conversion Rate, Settlement
      id10: [''], // Conversion Rate, Cardholder Billing
      id11: [''], // System Trace Audit Number
      id12: [''], // Time, Local Transaction
      id13: [''], // Date, Local Transaction
      id14: [''], // Date, Expiration
      id15: [''], // Date, Settlement
      id16: [''], // Date, Conversion
      id17: [''], // Date, Capture
      id18: [''], // Merchant Category Code
      id19: [''], // Acquiring Institution Country Code
      id20: [''], // PAN Extended Country Code
      id21: [''], // Forwarding Institution Country Code
      id22: [''], // Point of Service Entry Mode
      id23: [''], // Card Sequence Number
      id24: [''], // Function Code
      id25: [''], // Point of Service Condition Code
      id26: [''], // POS Capture Code
      id27: [''], // Authorizing Identification Response Length
      id28: [''], // Amount, Transaction Fee
      id29: [''], // Amount, Settlement Fee
      id30: [''], // Amount, Transaction Processing Fee
      id31: [''], // Amount, Settlement Processing Fee
      id32: [''], // Acquiring Institution ID Code
      id33: [''], // Forwarding Institution ID Code
      id34: [''], // Primary Account Number, Extended
      id35: [''], // Track 2 Data
      id36: [''], // Track 3 Data
      id37: [''], // Retrieval Reference Number
      id38: [''], // Authorization Identification Response
      id39: [''], // Response Code
      id40: [''], // Service Restriction Code
      id41: [''], // Card Acceptor Terminal Identification
      id42: [''], // Card Acceptor Identification Code
      id43: [''], // Card Acceptor Name/Location
      id44: [''], // Additional Response Data
      id45: [''], // Track 1 Data
      id46: [''], // Additional Data - ISO
      id47: [''], // Additional Data - National
      id48: [''], // Additional Data - Private
      id49: ['']  // Currency Code, Transaction
    });
  }

  ngOnInit(): void {}

  generateMessage(): void {
    console.log(this.messageForm.value);
    // Logique pour générer le message ici
  }

  getFieldName(key: string): string {
    return this.fieldNames[key] || key;
  }
} 