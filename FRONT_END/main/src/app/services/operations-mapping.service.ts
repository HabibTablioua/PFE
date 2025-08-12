import { Injectable } from '@angular/core';

export interface OperationMapping {
  code: string;
  description: string;
  icon: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class OperationsMappingService {

  private operationsMap: Map<string, OperationMapping> = new Map([
    // Opérations de paiement
    ['200000', { code: '200000', description: 'Paiement par carte', icon: 'credit_card', category: 'Paiement' }],
    ['200001', { code: '200001', description: 'Paiement en ligne', icon: 'computer', category: 'Paiement' }],
    ['200002', { code: '200002', description: 'Paiement mobile', icon: 'smartphone', category: 'Paiement' }],
    ['200003', { code: '200003', description: 'Paiement sans contact', icon: 'nfc', category: 'Paiement' }],
    
    // Opérations de retrait
    ['310000', { code: '310000', description: 'Retrait DAB', icon: 'atm', category: 'Retrait' }],
    ['310001', { code: '310001', description: 'Retrait guichet', icon: 'account_balance', category: 'Retrait' }],
    ['310002', { code: '310002', description: 'Retrait international', icon: 'public', category: 'Retrait' }],
    
    // Opérations de virement
    ['400000', { code: '400000', description: 'Virement bancaire', icon: 'swap_horiz', category: 'Virement' }],
    ['400001', { code: '400001', description: 'Virement SEPA', icon: 'euro', category: 'Virement' }],
    ['400002', { code: '400002', description: 'Virement international', icon: 'language', category: 'Virement' }],
    
    // Opérations de prélèvement
    ['500000', { code: '500000', description: 'Prélèvement automatique', icon: 'schedule', category: 'Prélèvement' }],
    ['500001', { code: '500001', description: 'Prélèvement ponctuel', icon: 'payment', category: 'Prélèvement' }],
    
    // Opérations Internet
    ['600000', { code: '600000', description: 'Paiement Internet', icon: 'wifi', category: 'Internet' }],
    ['600001', { code: '600001', description: 'E-commerce', icon: 'shopping_cart', category: 'Internet' }],
    ['600002', { code: '600002', description: 'Services en ligne', icon: 'cloud', category: 'Internet' }],
    
    // Opérations à l'étranger
    ['700000', { code: '700000', description: 'Paiement à l\'étranger', icon: 'flight', category: 'International' }],
    ['700001', { code: '700001', description: 'Retrait à l\'étranger', icon: 'public', category: 'International' }],
    
    // Opérations premium
    ['800000', { code: '800000', description: 'Paiement premium', icon: 'star', category: 'Premium' }],
    ['800001', { code: '800001', description: 'Services VIP', icon: 'workspace_premium', category: 'Premium' }],
    
    // Aucune restriction
    ['999999', { code: '999999', description: 'Aucune restriction', icon: 'check_circle', category: 'Général' }]
  ]);

  constructor() { }

  /**
   * Convertit un code d'opération en description
   */
  getDescription(code: string): string {
    const operation = this.operationsMap.get(code);
    return operation ? operation.description : code;
  }

  /**
   * Convertit une liste de codes séparés par des virgules en descriptions
   */
  getDescriptions(codes: string): string {
    if (!codes || codes.trim() === '') {
      return 'Aucune restriction spécifiée';
    }

    const codeList = codes.split(',').map(code => code.trim());
    const descriptions = codeList.map(code => this.getDescription(code));
    
    return descriptions.join(', ');
  }

  /**
   * Récupère toutes les informations d'une opération
   */
  getOperation(code: string): OperationMapping | undefined {
    return this.operationsMap.get(code);
  }

  /**
   * Récupère toutes les opérations disponibles
   */
  getAllOperations(): OperationMapping[] {
    return Array.from(this.operationsMap.values());
  }

  /**
   * Récupère les opérations par catégorie
   */
  getOperationsByCategory(category: string): OperationMapping[] {
    return this.getAllOperations().filter(op => op.category === category);
  }

  /**
   * Vérifie si un code est valide
   */
  isValidCode(code: string): boolean {
    return this.operationsMap.has(code);
  }

  /**
   * Suggère des codes basés sur une description
   */
  suggestCodes(description: string): OperationMapping[] {
    const searchTerm = description.toLowerCase();
    return this.getAllOperations().filter(op => 
      op.description.toLowerCase().includes(searchTerm) ||
      op.category.toLowerCase().includes(searchTerm)
    );
  }
} 