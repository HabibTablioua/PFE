import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-iso-depacker',
  templateUrl: './iso-depacker.component.html',
  styleUrls: [],
  standalone: true,
  imports: [
    CommonModule, 
    MaterialModule, 
    HttpClientModule, 
    MatSnackBarModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatInputModule,
    AppHeaderComponent, 
    FormsModule
  ],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('0.6s cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ],
  styles: [`
    .depacker-container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    }

    /* Section d'accueil */
    .depack-button-section {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .welcome-card {
      background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
      border-radius: 24px;
      padding: 48px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      max-width: 500px;
      width: 100%;
    }

    .welcome-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
    }

    .welcome-icon mat-icon {
      color: white;
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .welcome-title {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }

    .welcome-description {
      font-size: 16px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 32px 0;
    }

    .main-action-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 16px 32px;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
    }

    .main-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
    }

    /* Zone de formulaire */
    .depack-form-area {
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 40px;
    }

    .form-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-icon {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-text h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .header-text p {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }

    /* Zone de saisie */
    .input-section {
      padding: 32px;
      background: #f8fafc;
    }

    .iso-textarea-wrapper {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .textarea-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .textarea-icon {
      background: #e0e7ff;
      color: #3730a3;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .textarea-info h4 {
      margin: 0 0 4px 0;
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
    }

    .textarea-info p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .depack-textarea {
      width: 100%;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      resize: vertical;
      transition: border-color 0.3s ease;
    }

    .depack-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .textarea-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }

    .char-count {
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
    }

    .format-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #059669;
      font-size: 14px;
      font-weight: 500;
    }

    /* Boutons d'action - Design moderne et centré */
    .action-buttons-modern {
      padding: 32px;
      background: white;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .buttons-container {
      display: flex;
      gap: 20px;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Bouton Analyser - Principal */
    .analyze-btn-modern {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      min-width: 120px;
      height: 44px;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      position: relative;
      overflow: hidden;
    }

    .analyze-btn-modern::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .analyze-btn-modern:hover::before {
      left: 100%;
    }

    .analyze-btn-modern:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
    }

    .analyze-btn-modern:active {
      transform: translateY(-2px) scale(0.98);
    }

    .analyze-btn-modern mat-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Bouton Réinitialiser - Secondaire */
    .reset-btn-modern {
      background: white;
      color: #3b82f6;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      min-width: 120px;
      height: 44px;
      border: 2px solid #3b82f6;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .reset-btn-modern::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 100%;
      background: #3b82f6;
      transition: width 0.3s ease;
      z-index: -1;
    }

    .reset-btn-modern:hover::before {
      width: 100%;
    }

    .reset-btn-modern:hover {
      color: white;
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }

    .reset-btn-modern:active {
      transform: translateY(-2px) scale(0.98);
    }

    .reset-btn-modern mat-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Bouton Annuler - Danger */
    .cancel-btn-modern {
      background: white;
      color: #ef4444;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      min-width: 120px;
      height: 44px;
      border: 2px solid #ef4444;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .cancel-btn-modern::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 100%;
      background: #ef4444;
      transition: width 0.3s ease;
      z-index: -1;
    }

    .cancel-btn-modern:hover::before {
      width: 100%;
    }

    .cancel-btn-modern:hover {
      color: white;
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
    }

    .cancel-btn-modern:active {
      transform: translateY(-2px) scale(0.98);
    }

    .cancel-btn-modern mat-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Animation d'apparition des boutons */
    .buttons-container button {
      animation: buttonSlideIn 0.6s ease forwards;
      opacity: 0;
      transform: translateY(20px);
    }

    .buttons-container button:nth-child(1) { animation-delay: 0.1s; }
    .buttons-container button:nth-child(2) { animation-delay: 0.2s; }
    .buttons-container button:nth-child(3) { animation-delay: 0.3s; }

    @keyframes buttonSlideIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Section des résultats - Design moderne */
    .results-section {
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 40px;
    }

    .results-header-modern {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .results-main-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .success-icon {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .success-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .results-title-modern h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .success-subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }

    /* Carte du résultat brut */
    .raw-result-card {
      margin: 24px;
      background: #f8fafc;
      border-radius: 16px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-header h4 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
    }

    .raw-content {
      padding: 24px;
    }

    .generated-message-modern {
      background: #1e293b;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 12px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.6;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Actions de téléchargement */
    .download-actions {
      padding: 24px;
      background: white;
      border-top: 1px solid #e2e8f0;
    }

    .download-actions h4 {
      margin: 0 0 16px 0;
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
    }

    .download-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .download-btn {
      border-radius: 10px;
      font-weight: 500;
      padding: 10px 20px;
      min-width: 80px;
      height: 40px;
      border: 2px solid #3b82f6;
      color: #3b82f6;
      background: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .download-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 100%;
      background: #3b82f6;
      transition: width 0.3s ease;
      z-index: -1;
    }

    .download-btn:hover::before {
      width: 100%;
    }

    .download-btn:hover {
      color: white;
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }

    .download-btn:active {
      transform: translateY(-1px) scale(0.98);
    }

    .download-btn mat-icon {
      margin-right: 6px;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Section des champs - Design moderne */
    .fields-section-modern {
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 40px;
    }

    .section-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px;
      text-align: center;
    }

    .section-header h3 {
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .section-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }

    /* Filtres et recherche */
    .filters-section {
      padding: 24px 32px;
      background: #f8fafc;
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field, .filter-field {
      min-width: 250px;
    }

    /* Grille des champs */
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      padding: 32px;
    }

    .field-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 2px solid transparent;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .field-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

    .field-card.highlighted {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .field-id-badge {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border-radius: 20px;
      padding: 8px 16px;
      font-weight: 700;
      font-size: 16px;
      min-width: 40px;
      text-align: center;
    }

    .field-actions {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .field-card:hover .field-actions {
      opacity: 1;
    }

    .field-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field-name-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .field-name {
      margin: 0;
      color: #1e293b;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.4;
      flex: 1;
    }

    .field-type-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .type-badge.type-date {
      background: #fef3c7;
      color: #92400e;
    }

    .type-badge.type-amount {
      background: #dbeafe;
      color: #1e40af;
    }

    .type-badge.type-card {
      background: #dcfce7;
      color: #166534;
    }

    .type-badge.type-other {
      background: #f3e8ff;
      color: #7c3aed;
    }

    .field-value-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .value-display {
      background: #f8fafc;
      border-radius: 8px;
      padding: 12px;
      border: 1px solid #e2e8f0;
    }

    .field-value {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      color: #1e293b;
      word-break: break-all;
      line-height: 1.4;
    }

    .field-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #64748b;
    }

    .field-meta span {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .field-meta mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Pagination */
    .pagination-section {
      padding: 24px 32px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: center;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .depacker-container {
        padding: 0 16px;
        margin: 20px auto;
      }

      .results-header-modern {
        flex-direction: column;
        gap: 24px;
        text-align: center;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field, .filter-field {
        min-width: auto;
      }

      .fields-grid {
        grid-template-columns: 1fr;
        padding: 20px;
      }

      .action-buttons {
        flex-direction: column;
      }

      /* Styles responsive pour les nouveaux boutons */
      .buttons-container {
        flex-direction: column;
        gap: 16px;
      }

      .analyze-btn-modern,
      .reset-btn-modern,
      .cancel-btn-modern {
        min-width: 160px;
        width: 100%;
        max-width: 250px;
      }
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .field-card {
      animation: fadeInUp 0.6s ease forwards;
    }

    .field-card:nth-child(1) { animation-delay: 0.1s; }
    .field-card:nth-child(2) { animation-delay: 0.2s; }
    .field-card:nth-child(3) { animation-delay: 0.3s; }
    .field-card:nth-child(4) { animation-delay: 0.4s; }
    .field-card:nth-child(5) { animation-delay: 0.5s; }
    .field-card:nth-child(6) { animation-delay: 0.6s; }
  `]
})
export class IsoDepackerComponent implements OnInit {
  showDepackerArea = false;
  isoMessage = '';
  depackedResult = '';
  fields: any[] = [];
  
  // Nouvelles propriétés pour le design moderne
  searchTerm = '';
  selectedFieldType = '';
  processingStartTime = 0;
  processingEndTime = 0;

  fieldNames: { [key: number]: string } = {
    0: 'Message Type Indicator (MTI)',
    1: 'Bitmap',
    2: 'Primary Account Number',
    3: 'Processing Code',
    4: 'Amount, Transaction',
    5: 'Amount, Settlement',
    6: 'Amount, Cardholder Billing',
    7: 'Transmission Date & Time',
    8: 'Amount, Cardholder Billing Fee',
    9: 'Conversion Rate, Settlement',
    10: 'Conversion Rate, Cardholder Billing',
    11: 'System Trace Audit Number',
    12: 'Time, Local Transaction',
    13: 'Date, Local Transaction',
    14: 'Date, Expiration',
    15: 'Date, Settlement',
    16: 'Date, Conversion',
    17: 'Date, Capture',
    18: 'Merchant Category Code',
    19: 'Acquiring Institution Country Code',
    20: 'PAN Extended Country Code',
    21: 'Forwarding Institution Country Code',
    22: 'Point of Service Entry Mode',
    23: 'Card Sequence Number',
    24: 'Function Code',
    25: 'Point of Service Condition Code',
    26: 'POS Capture Code',
    27: 'Authorizing Identification Response Length',
    28: 'Amount, Transaction Fee',
    29: 'Amount, Settlement Fee',
    30: 'Amount, Transaction Processing Fee',
    31: 'Amount, Settlement Processing Fee',
    32: 'Acquiring Institution ID Code',
    33: 'Forwarding Institution ID Code',
    34: 'Primary Account Number, Extended',
    35: 'Track 2 Data',
    36: 'Track 3 Data',
    37: 'Retrieval Reference Number',
    38: 'Authorization Identification Response',
    39: 'Response Code',
    40: 'Service Restriction Code',
    41: 'Card Acceptor Terminal Identification',
    42: 'Card Acceptor Identification Code',
    43: 'Card Acceptor Name/Location',
    44: 'Additional Response Data',
    45: 'Track 1 Data',
    46: 'Additional Data - ISO',
    47: 'Additional Data - National',
    48: 'Additional Data - Private',
    49: 'Currency Code, Transaction',
    50: 'Currency Code, Settlement',
    51: 'Currency Code, Cardholder Billing',
    52: 'Personal Identification Number (PIN) Data',
    53: 'Security Related Control Information',
    54: 'Additional Amounts',
    55: 'ICC System Related Data',
    56: 'Original Data Elements',
    57: 'Authorization Life Cycle Code',
    58: 'Authorizing Agent Institution ID',
    59: 'Additional Data - National',
    60: 'Reserved for National Use',
    61: 'Reserved for National Use',
    62: 'Reserved for National Use',
    63: 'Reserved for National Use',
    64: 'Message Authentication Code (MAC)',
    65: 'Extended Payment Code',
    66: 'Settlement Code',
    67: 'Extended Payment Data',
    68: 'Receiving Institution Country Code',
    69: 'Settlement Institution Country Code',
    70: 'Network Management Information Code',
    71: 'Message Number',
    72: 'Message Number Last',
    73: 'Date, Action',
    74: 'Credits, Number',
    75: 'Credits, Reversal Number',
    76: 'Debits, Number',
    77: 'Debits, Reversal Number',
    78: 'Transfer Number',
    79: 'Transfer, Reversal Number',
    80: 'Inquiries, Number',
    81: 'Authorizations, Number',
    82: 'Credits, Processing Fee Amount',
    83: 'Credits, Transaction Fee Amount',
    84: 'Debits, Processing Fee Amount',
    85: 'Debits, Transaction Fee Amount',
    86: 'Credits, Amount',
    87: 'Credits, Reversal Amount',
    88: 'Debits, Amount',
    89: 'Debits, Reversal Amount',
    90: 'Original Data Elements',
    91: 'File Update Code',
    92: 'File Security Code',
    93: 'Response Indicator',
    94: 'Service Indicator',
    95: 'Replacement Amounts',
    96: 'Message Security Code',
    97: 'Amount, Net Settlement',
    98: 'Payee',
    99: 'Settlement Institution ID Code',
    100: 'Receiving Institution ID Code',
    101: 'File Name',
    102: 'Account Identification 1',
    103: 'Account Identification 2',
    104: 'Transaction Description',
    105: 'Reserved for ISO Use',
    106: 'Reserved for ISO Use',
    107: 'Reserved for ISO Use',
    108: 'Reserved for ISO Use',
    109: 'Reserved for ISO Use',
    110: 'Reserved for ISO Use',
    111: 'Reserved for ISO Use',
    112: 'Reserved for National Use',
    113: 'Reserved for National Use',
    114: 'Reserved for National Use',
    115: 'Reserved for National Use',
    116: 'Reserved for National Use',
    117: 'Reserved for National Use',
    118: 'Reserved for National Use',
    119: 'Reserved for National Use',
    120: 'Reserved for National Use',
    121: 'Reserved for National Use',
    122: 'Reserved for National Use',
    123: 'Reserved for National Use',
    124: 'Reserved for National Use',
    125: 'Reserved for National Use',
    126: 'Reserved for National Use',
    127: 'Reserved for National Use',
    128: 'Message Authentication Code'
  };

  constructor(
    private http: HttpClient, 
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Vérifier l'état de l'authentification au démarrage
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    const isAuth = this.authService.isAuthenticated();
    const token = localStorage.getItem('token');
    console.log('État de l\'authentification:', isAuth);
    console.log('Token présent:', !!token);
    if (token) {
      console.log('Token (premiers caractères):', token.substring(0, 20) + '...');
      
      // Test de connexion au gateway
      this.testGatewayConnection();
    }
  }

  testGatewayConnection(): void {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // Test simple de connexion au gateway
    this.http.get('http://localhost:8088/api/incidents/count', { headers })
      .subscribe({
        next: (result) => {
          console.log('✅ Connexion au gateway réussie:', result);
        },
        error: (error) => {
          console.error('❌ Erreur de connexion au gateway:', error);
          if (error.status === 401) {
            console.error('Erreur 401: Token invalide ou expiré');
          }
        }
      });
  }

  toggleDepackerArea(): void {
    this.showDepackerArea = !this.showDepackerArea;
    if (!this.showDepackerArea) {
      this.resetDepacker();
    }
  }

  analyzeMessage(): void {
    if (!this.isoMessage.trim()) {
      this.snackBar.open('Veuillez saisir un message ISO à analyser.', 'Fermer', { duration: 3000 });
      return;
    }

    // Vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Vous devez être connecté pour analyser un message ISO.', 'Fermer', { duration: 5000 });
      return;
    }

    // Démarrer le chronomètre
    this.startProcessingTimer();

    // Récupérer le token JWT et créer les en-têtes (comme dans incident.service.ts)
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      headers = headers.set('Content-Type', 'text/plain');
    }

    // Utiliser l'URL absolue comme dans incident.service.ts
    this.http.post('http://localhost:8088/api/depacking', this.isoMessage, { 
      responseType: 'text',
      headers: headers
    })
      .subscribe({
        next: (result) => {
          // Arrêter le chronomètre
          this.stopProcessingTimer();
          
          this.depackedResult = result;
          this.parseFields();
        this.snackBar.open('Message analysé avec succès !', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
          // Arrêter le chronomètre même en cas d'erreur
          this.stopProcessingTimer();
          
          console.error('Erreur lors de l\'analyse:', error);
          if (error.status === 401) {
            this.snackBar.open('Erreur d\'authentification. Veuillez vous reconnecter.', 'Fermer', { duration: 5000 });
        } else {
          this.snackBar.open('Erreur lors de l\'analyse du message ISO.', 'Fermer', { duration: 5000 });
          }
        }
    });
  }

  resetDepacker(): void {
    this.isoMessage = '';
    this.depackedResult = '';
    this.fields = [];
  }

  copyResult(): void {
    navigator.clipboard.writeText(this.depackedResult).then(() => {
      this.snackBar.open('Résultat copié dans le presse-papiers !', 'Fermer', { duration: 2000 });
    });
  }

  copyFieldValue(value: string): void {
    navigator.clipboard.writeText(value).then(() => {
      this.snackBar.open('Valeur copiée dans le presse-papiers !', 'Fermer', { duration: 2000 });
    });
  }

  getFieldName(id: number): string {
    return this.fieldNames[id] || `Champ ${id}`;
  }

  getValueLength(value: string): number {
    return value ? value.length : 0;
  }

  private parseFields(): void {
    // Logique pour parser les champs à partir du résultat
    // Cette méthode peut être étendue selon vos besoins
    this.fields = [];
  }

  // Nouvelles méthodes pour le design moderne
  getFilteredFields(): any[] {
    let filtered = this.fields;
    
    // Filtrage par recherche
    if (this.searchTerm) {
      filtered = filtered.filter(field => 
        field.id.toString().includes(this.searchTerm) ||
        this.getFieldName(field.id).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        field.value.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Filtrage par type
    if (this.selectedFieldType) {
      filtered = filtered.filter(field => this.getFieldType(field.id) === this.selectedFieldType);
    }
    
    return filtered;
  }

  isFieldHighlighted(field: any): boolean {
    return this.searchTerm && (
      field.id.toString().includes(this.searchTerm) ||
      this.getFieldName(field.id).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      field.value.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getFieldType(fieldId: number): string {
    // Logique pour déterminer le type de champ
    if ([2, 14, 15, 16, 17].includes(fieldId)) return 'date';
    if ([3, 4, 5, 6, 8, 9, 10].includes(fieldId)) return 'amount';
    if ([2, 35, 45, 52, 53, 55].includes(fieldId)) return 'card';
    return 'other';
  }

  getFieldTypeClass(fieldId: number): string {
    const type = this.getFieldType(fieldId);
    return `type-badge type-${type}`;
  }

  getFieldFormat(value: string): string {
    // Détection automatique du format
    if (/^\d{6}$/.test(value)) return 'MMDDYY';
    if (/^\d{4}$/.test(value)) return 'MMDD';
    if (/^\d{6}$/.test(value) && parseInt(value) > 240000) return 'HHMMSS';
    if (/^\d{12}$/.test(value)) return 'Amount';
    if (/^\d{16}$/.test(value)) return 'Card';
    return 'Text';
  }

  // Méthode pour démarrer le chronomètre
  startProcessingTimer(): void {
    this.processingStartTime = Date.now();
  }

  // Méthode pour arrêter le chronomètre
  stopProcessingTimer(): void {
    this.processingEndTime = Date.now();
  }

  // Méthodes de téléchargement
  downloadJson(): void {
    this.downloadFile('json', 'application/json', 'depacked.json');
  }

  downloadXml(): void {
    this.downloadFile('xml', 'application/xml', 'depacked.xml');
  }

  downloadCsv(): void {
    this.downloadFile('csv', 'text/csv', 'depacked.csv');
  }

  downloadTxt(): void {
    this.downloadFile('txt', 'text/plain', 'depacked.txt');
  }

  private downloadFile(format: string, contentType: string, filename: string): void {
    if (!this.isoMessage.trim()) {
      this.snackBar.open('Aucun message ISO à télécharger.', 'Fermer', { duration: 3000 });
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Vous devez être connecté pour télécharger.', 'Fermer', { duration: 5000 });
      return;
    }

    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      headers = headers.set('Content-Type', 'text/plain');
    }

    // Afficher un message de chargement
    this.snackBar.open(`Téléchargement du fichier ${format.toUpperCase()} en cours...`, 'Fermer', { duration: 2000 });

    this.http.post(`http://localhost:8088/api/depacking/download/${format}`, this.isoMessage, {
      responseType: 'blob',
      headers: headers
    }).subscribe({
      next: (blob: Blob) => {
        // Créer le lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open(`Fichier ${format.toUpperCase()} téléchargé avec succès !`, 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        console.error(`Erreur lors du téléchargement ${format}:`, error);
        if (error.status === 401) {
          this.snackBar.open('Erreur d\'authentification lors du téléchargement.', 'Fermer', { duration: 5000 });
        } else {
          this.snackBar.open(`Erreur lors du téléchargement du fichier ${format.toUpperCase()}.`, 'Fermer', { duration: 5000 });
        }
      }
    });
  }
} 