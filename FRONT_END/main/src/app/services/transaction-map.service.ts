import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CountryTransaction {
  countryCode: string;
  countryName: string;
  transactionCount: number;
  totalAmount?: number;
  lastTransaction?: string;
}

export interface TransactionMapData {
  [countryCode: string]: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionMapService {
  private apiUrl = 'http://localhost:8088/api'; // URL du Gateway

  constructor(private http: HttpClient) {}

  /**
   * Récupère le nombre de transactions par pays
   */
  getTransactionsByCountry(): Observable<TransactionMapData> {
    return this.http.get<any[]>(`${this.apiUrl}/history`).pipe(
      map(transactions => this.aggregateTransactionsByCountry(transactions))
    );
  }

  /**
   * Récupère les détails des transactions par pays
   */
  getCountryTransactionDetails(): Observable<CountryTransaction[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`).pipe(
      map(transactions => this.getDetailedCountryData(transactions))
    );
  }

  /**
   * Agrège les transactions par pays
   */
  private aggregateTransactionsByCountry(transactions: any[]): TransactionMapData {
    const countryMap: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      // Extraire le code pays depuis le champ DE19 (Country Code)
      const countryCode = this.extractCountryCode(transaction);
      
      if (countryCode) {
        countryMap[countryCode] = (countryMap[countryCode] || 0) + 1;
      }
    });
    
    return countryMap;
  }

  /**
   * Extrait le code pays depuis une transaction
   */
  private extractCountryCode(transaction: any): string | null {
    // Méthode 1: Depuis le champ DE19 (Country Code)
    if (transaction.fields && transaction.fields['19']) {
      return transaction.fields['19'];
    }
    
    // Méthode 2: Depuis le champ DE19 dans les données JSON
    if (transaction.fieldsJson) {
      try {
        const fields = JSON.parse(transaction.fieldsJson);
        if (fields['19']) {
          return fields['19'];
        }
      } catch (e) {
        console.warn('Erreur parsing fieldsJson:', e);
      }
    }
    
    // Méthode 3: Depuis le champ DE19 dans le message ISO
    if (transaction.messageIso) {
      return this.extractFieldFromISO(transaction.messageIso, '19');
    }
    
    return null;
  }

  /**
   * Extrait un champ spécifique d'un message ISO
   */
  private extractFieldFromISO(messageIso: string, fieldNumber: string): string | null {
    try {
      // Recherche du champ dans le message
      const fieldPattern = new RegExp(`DE${fieldNumber}[:\\s]*([^\\s]+)`, 'i');
      const match = messageIso.match(fieldPattern);
      return match ? match[1] : null;
    } catch (e) {
      console.warn('Erreur extraction champ ISO:', e);
      return null;
    }
  }

  /**
   * Obtient les données détaillées par pays
   */
  private getDetailedCountryData(transactions: any[]): CountryTransaction[] {
    const countryMap: { [key: string]: CountryTransaction } = {};
    
    transactions.forEach(transaction => {
      const countryCode = this.extractCountryCode(transaction);
      
      if (countryCode) {
        if (!countryMap[countryCode]) {
          countryMap[countryCode] = {
            countryCode,
            countryName: this.getCountryName(countryCode),
            transactionCount: 0,
            totalAmount: 0,
            lastTransaction: transaction.timestamp || transaction.createdAt
          };
        }
        
        countryMap[countryCode].transactionCount++;
        
        if (transaction.amount) {
          countryMap[countryCode].totalAmount = 
            (countryMap[countryCode].totalAmount || 0) + parseFloat(transaction.amount);
        }
        
        if (transaction.timestamp || transaction.createdAt) {
          const currentTime = transaction.timestamp || transaction.createdAt;
          if (!countryMap[countryCode].lastTransaction || 
              currentTime > countryMap[countryCode].lastTransaction) {
            countryMap[countryCode].lastTransaction = currentTime;
          }
        }
      }
    });
    
    return Object.values(countryMap);
  }

  /**
   * Obtient le nom du pays à partir du code
   */
  private getCountryName(countryCode: string): string {
    const countryNames: { [key: string]: string } = {
      'US': 'États-Unis',
      'CA': 'Canada',
      'FR': 'France',
      'DE': 'Allemagne',
      'GB': 'Royaume-Uni',
      'IT': 'Italie',
      'ES': 'Espagne',
      'NL': 'Pays-Bas',
      'BE': 'Belgique',
      'CH': 'Suisse',
      'AT': 'Autriche',
      'SE': 'Suède',
      'NO': 'Norvège',
      'DK': 'Danemark',
      'FI': 'Finlande',
      'PL': 'Pologne',
      'CZ': 'République Tchèque',
      'HU': 'Hongrie',
      'RO': 'Roumanie',
      'BG': 'Bulgarie',
      'HR': 'Croatie',
      'SI': 'Slovénie',
      'SK': 'Slovaquie',
      'EE': 'Estonie',
      'LV': 'Lettonie',
      'LT': 'Lituanie',
      'IE': 'Irlande',
      'PT': 'Portugal',
      'GR': 'Grèce',
      'CY': 'Chypre',
      'MT': 'Malte',
      'LU': 'Luxembourg',
      'JP': 'Japon',
      'CN': 'Chine',
      'KR': 'Corée du Sud',
      'IN': 'Inde',
      'BR': 'Brésil',
      'MX': 'Mexique',
      'AR': 'Argentine',
      'CL': 'Chili',
      'CO': 'Colombie',
      'PE': 'Pérou',
      'VE': 'Venezuela',
      'EC': 'Équateur',
      'BO': 'Bolivie',
      'PY': 'Paraguay',
      'UY': 'Uruguay',
      'GY': 'Guyana',
      'SR': 'Suriname',
      'AU': 'Australie',
      'NZ': 'Nouvelle-Zélande',
      'ZA': 'Afrique du Sud',
      'EG': 'Égypte',
      'NG': 'Nigeria',
      'KE': 'Kenya',
      'GH': 'Ghana',
      'UG': 'Ouganda',
      'TZ': 'Tanzanie',
      'ET': 'Éthiopie',
      'DZ': 'Algérie',
      'MA': 'Maroc',
      'TN': 'Tunisie',
      'LY': 'Libye',
      'SD': 'Soudan',
      'TD': 'Tchad',
      'NE': 'Niger',
      'ML': 'Mali',
      'BF': 'Burkina Faso',
      'CI': 'Côte d\'Ivoire',
      'SN': 'Sénégal',
      'GN': 'Guinée',
      'SL': 'Sierra Leone',
      'LR': 'Libéria',
      'TG': 'Togo',
      'BJ': 'Bénin',
      'CM': 'Cameroun',
      'CF': 'République centrafricaine',
      'CG': 'République du Congo',
      'CD': 'République démocratique du Congo',
      'GA': 'Gabon',
      'GQ': 'Guinée équatoriale',
      'ST': 'Sao Tomé-et-Principe',
      'AO': 'Angola',
      'ZM': 'Zambie',
             'ZW': 'Zimbabwe',
       'BW': 'Botswana',
       'NA': 'Namibie',
       'SZ': 'Eswatini',
       'LS': 'Lesotho',
       'MG': 'Madagascar',
       'MU': 'Maurice',
       'SC': 'Seychelles',
       'KM': 'Comores',
       'DJ': 'Djibouti',
       'SO': 'Somalie',
       'ER': 'Érythrée',
       'RW': 'Rwanda',
       'BI': 'Burundi',
       'MW': 'Malawi',
       'MZ': 'Mozambique'
    };
    
    return countryNames[countryCode] || countryCode;
  }

  /**
   * Obtient les données pour la carte Leaflet
   */
  getMapData(): Observable<any> {
    return this.getTransactionsByCountry().pipe(
      map(countryData => this.formatForLeaflet(countryData))
    );
  }

  /**
   * Formate les données pour Leaflet
   */
  private formatForLeaflet(countryData: TransactionMapData): any[] {
    const mapData: any[] = [];
    
    Object.entries(countryData).forEach(([countryCode, count]) => {
      mapData.push({
        type: 'Feature',
        properties: {
          country: countryCode,
          name: this.getCountryName(countryCode),
          count: count,
          color: this.getColorByCount(count)
        },
        geometry: {
          type: 'Point',
          coordinates: this.getCountryCoordinates(countryCode)
        }
      });
    });
    
    return mapData;
  }

  /**
   * Obtient la couleur en fonction du nombre de transactions
   */
  private getColorByCount(count: number): string {
    if (count >= 100) return '#d73027'; // Rouge foncé
    if (count >= 50) return '#fc8d59';  // Orange
    if (count >= 20) return '#fee08b';  // Jaune
    if (count >= 10) return '#d9ef8b';  // Vert clair
    if (count >= 5) return '#91cf60';   // Vert
    return '#1a9850'; // Vert foncé
  }

  /**
   * Obtient les coordonnées approximatives d'un pays
   */
  private getCountryCoordinates(countryCode: string): [number, number] {
    const coordinates: { [key: string]: [number, number] } = {
      'US': [-98.5795, 39.8283],
      'CA': [-106.3468, 56.1304],
      'FR': [2.2137, 46.2276],
      'DE': [10.4515, 51.1657],
      'GB': [-0.1278, 51.5074],
      'IT': [12.5674, 41.8719],
      'ES': [-3.7492, 40.4637],
      'NL': [5.2913, 52.1326],
      'BE': [4.3517, 50.8503],
      'CH': [8.2275, 46.8182],
      'AT': [14.5501, 47.5162],
      'SE': [18.6435, 60.1282],
      'NO': [8.4689, 60.4720],
      'DK': [9.5018, 56.2639],
      'FI': [25.7482, 61.9241],
      'PL': [19.1451, 51.9194],
      'CZ': [15.4730, 49.8175],
      'HU': [19.5033, 47.1625],
      'RO': [24.9668, 45.9432],
      'BG': [25.4858, 42.7339],
      'HR': [15.2, 45.1],
      'SI': [14.9955, 46.0569],
      'SK': [19.6990, 48.6690],
      'EE': [25.0136, 58.3776],
      'LV': [24.6032, 56.8796],
      'LT': [23.8811, 55.1694],
      'IE': [-8.2439, 53.4129],
      'PT': [-8.2245, 39.3999],
      'GR': [21.8243, 39.0742],
      'CY': [33.4299, 35.1264],
      'MT': [14.3754, 35.9375],
      'LU': [6.1296, 49.8153],
      'JP': [138.2529, 36.2048],
      'CN': [104.1954, 35.8617],
      'KR': [127.7669, 35.9078],
      'IN': [78.9629, 20.5937],
      'BR': [-51.9253, -14.2350],
      'MX': [-102.5528, 23.6345],
      'AR': [-63.6167, -38.4161],
      'CL': [-71.5430, -35.6751],
      'CO': [-74.2973, 4.5709],
      'PE': [-75.0152, -9.1900],
      'VE': [-66.5897, 6.4237],
      'EC': [-78.1834, -1.8312],
      'BO': [-63.5887, -16.2902],
      'PY': [-58.4438, -23.4425],
      'UY': [-55.7658, -32.5228],
      'GY': [-58.9302, 4.8604],
      'SR': [-56.0278, 3.9193],
      'AU': [133.7751, -25.2744],
      'NZ': [174.8860, -40.9006],
      'ZA': [24.9916, -30.5595],
      'EG': [30.8025, 26.8206],
      'NG': [8.6753, 9.0820],
      'KE': [37.9062, -0.0236],
      'GH': [-1.0232, 7.9465],
      'UG': [32.2903, 1.3733],
      'TZ': [34.8888, -6.3690],
      'ET': [40.4897, 9.1450],
      'DZ': [1.6596, 28.0339],
      'MA': [-7.0926, 31.7917],
      'TN': [9.5375, 33.8869],
      'LY': [17.2283, 26.3351],
      'SD': [30.2176, 12.8628],
      'TD': [18.7322, 15.4542],
      'NE': [8.0817, 17.6078],
      'ML': [-3.9962, 17.5707],
      'BF': [-1.5616, 12.2383],
      'CI': [-5.5471, 7.5400],
      'SN': [-14.4524, 14.4974],
      'GN': [-9.6966, 9.9456],
      'SL': [-11.7799, 8.4606],
      'LR': [-9.4295, 6.4281],
      'TG': [0.8248, 8.6195],
      'BJ': [2.3158, 9.3077],
      'CM': [12.3547, 7.3697],
      'CF': [20.9394, 6.6111],
      'CG': [15.8277, -0.2280],
      'CD': [21.7587, -4.0383],
      'GA': [11.6094, -0.8037],
      'GQ': [10.2679, 1.6508],
      'ST': [6.6133, 0.1864],
      'AO': [17.8739, -11.2027],
      'ZM': [27.8493, -13.1339],
      'ZW': [29.8519, -19.0154],
      'BW': [24.6849, -22.3285],
      'NA': [18.4904, -22.9576],
      'SZ': [31.4659, -26.5225],
      'LS': [28.2336, -29.6099],
      'MG': [46.8691, -18.7669],
      'MU': [57.5522, -20.3484],
      'SC': [55.4915, -4.6796],
      'KM': [43.8722, -11.6455],
      'DJ': [42.5903, 11.8251],
      'SO': [46.1996, 5.1521],
      'ER': [39.7823, 15.1794],
      'RW': [29.8739, -1.9403],
      'BI': [29.9189, -3.3731],
      'MW': [34.3015, -13.2543],
      'MZ': [35.5296, -18.6657]
    };
    
    return coordinates[countryCode] || [0, 0];
  }
} 