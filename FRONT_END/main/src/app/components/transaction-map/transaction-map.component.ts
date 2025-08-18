import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TransactionMapService, TransactionMapData, CountryTransaction } from '../../services/transaction-map.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as L from 'leaflet';

@Component({
  selector: 'app-transaction-map',
  standalone: true,
  imports: [CommonModule, HttpClientModule, MatButtonModule, MatIconModule],
  template: `
    <div class="map-container">
      <div class="map-header">
        <h2>🌍 Carte des Transactions par Pays</h2>
        <div class="map-stats">
          <span class="stat-item">
            <i class="fas fa-globe"></i>
            Total Pays: {{ totalCountries }}
          </span>
          <span class="stat-item">
            <i class="fas fa-credit-card"></i>
            Total Transactions: {{ totalTransactions }}
          </span>
          <span class="stat-item">
            <i class="fas fa-chart-line"></i>
            Moyenne: {{ averageTransactions | number:'1.0-1' }}
          </span>
        </div>
        <button mat-raised-button color="primary" (click)="refreshData()" class="refresh-btn">
          <mat-icon>refresh</mat-icon>
          Actualiser
        </button>
      </div>
      
      <div id="transactionMap" class="map"></div>
      
      <div class="map-legend">
        <h4>Légende</h4>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-color" style="background: #e5f5e0;"></span>
            <span>0-5 transactions</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #a1d99b;"></span>
            <span>6-15 transactions</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #31a354;"></span>
            <span>16-30 transactions</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #006d2c;"></span>
            <span>31+ transactions</span>
          </div>
        </div>
      </div>

      <!-- Top 5 des pays -->
      <div class="top-countries">
        <h4>🏆 Top 5 des Pays</h4>
        <div class="top-list">
          <div *ngFor="let country of topCountries; let i = index" class="top-item">
            <span class="rank">{{ i + 1 }}</span>
            <span class="flag">🏳️</span>
            <span class="name">{{ country.countryName }}</span>
            <span class="count">{{ country.transactionCount }} transactions</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      padding: 20px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .map-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.8rem;
      font-weight: 600;
    }
    
    .map-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #7f8c8d;
      font-size: 0.9rem;
    }
    
    .refresh-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .refresh-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    
    .map {
      height: 500px;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 20px;
      border: 2px solid #f0f0f0;
    }
    
    .map-legend {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .map-legend h4 {
      margin: 0 0 15px 0;
      color: #2c3e50;
      font-size: 1.1rem;
    }
    
    .legend-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .top-countries {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
    }
    
    .top-countries h4 {
      margin: 0 0 15px 0;
      font-size: 1.2rem;
      text-align: center;
    }
    
    .top-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .top-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }
    
    .rank {
      background: rgba(255, 255, 255, 0.2);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
    }
    
    .flag {
      font-size: 1.5rem;
    }
    
    .name {
      flex: 1;
      font-weight: 500;
    }
    
    .count {
      background: rgba(255, 255, 255, 0.2);
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      .map-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .map-stats {
        justify-content: center;
      }
      
      .map {
        height: 400px;
      }
    }
  `]
})
export class TransactionMapComponent implements OnInit, OnDestroy {
  private map: L.Map | undefined;
  private markers: L.CircleMarker[] = [];
  
  totalCountries = 0;
  totalTransactions = 0;
  averageTransactions = 0;
  topCountries: CountryTransaction[] = [];

  constructor(private transactionMapService: TransactionMapService) {}

  ngOnInit(): void {
    this.initMap();
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Configuration de la carte Leaflet
    this.map = L.map('transactionMap').setView([20, 0], 2);
    
    // Ajout de la couche OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadData(): void {
    // Charger les données de la carte
    this.transactionMapService.getMapData().subscribe({
      next: (mapData) => {
        this.displayMapData(mapData);
        this.calculateStats(mapData);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données de la carte:', error);
      }
    });

    // Charger les détails des pays
    this.transactionMapService.getCountryTransactionDetails().subscribe({
      next: (countries) => {
        this.topCountries = countries
          .sort((a, b) => b.transactionCount - a.transactionCount)
          .slice(0, 5);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails des pays:', error);
      }
    });
  }

  private displayMapData(mapData: any[]): void {
    // Nettoyer les marqueurs existants
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Ajouter les nouveaux marqueurs
    mapData.forEach((feature: any) => {
      if (feature.geometry && feature.geometry.coordinates) {
        const [lng, lat] = feature.geometry.coordinates;
        const marker = L.circleMarker([lat, lng], {
          radius: this.getMarkerRadius(feature.properties.count),
          fillColor: this.getMarkerColor(feature.properties.count),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(this.map!);

        // Ajouter un popup avec les informations
        const popupContent = `
          <div style="text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${feature.properties.name}</h4>
            <p style="margin: 5px 0; color: #7f8c8d;">
              <strong>Code:</strong> ${feature.properties.country}
            </p>
            <p style="margin: 5px 0; color: #7f8c8d;">
              <strong>Transactions:</strong> ${feature.properties.count}
            </p>
          </div>
        `;
        marker.bindPopup(popupContent);

        this.markers.push(marker);
      }
    });
  }

  private getMarkerRadius(count: number): number {
    if (count >= 100) return 12;
    if (count >= 50) return 10;
    if (count >= 20) return 8;
    if (count >= 10) return 6;
    if (count >= 5) return 4;
    return 3;
  }

  private getMarkerColor(count: number): string {
    if (count >= 100) return '#d73027';
    if (count >= 50) return '#fc8d59';
    if (count >= 20) return '#fee08b';
    if (count >= 10) return '#d9ef8b';
    if (count >= 5) return '#91cf60';
    return '#1a9850';
  }

  private calculateStats(mapData: any[]): void {
    this.totalCountries = mapData.length;
    this.totalTransactions = mapData.reduce((sum: number, feature: any) => 
      sum + (feature.properties.count || 0), 0);
    this.averageTransactions = this.totalCountries > 0 ? 
      this.totalTransactions / this.totalCountries : 0;
  }

  refreshData(): void {
    this.loadData();
  }
} 