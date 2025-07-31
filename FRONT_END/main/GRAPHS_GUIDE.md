# 📊 Guide d'Utilisation des Graphiques

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser et personnaliser les graphiques dans votre dashboard.

## 🚀 Installation et Configuration

### 1. **Dépendances Installées**
```bash
npm install chart.js @types/chart.js
```

### 2. **Import dans Angular**
```typescript
import { Chart } from 'chart.js';
```

## 📈 Types de Graphiques Disponibles

### **1. Graphique Linéaire (Transactions)**
- **Type** : `line`
- **Utilisation** : Évolution temporelle
- **Couleur** : Bleu (#3b82f6)
- **Données** : Transactions par jour

### **2. Graphique Circulaire (Incidents)**
- **Type** : `doughnut`
- **Utilisation** : Répartition par catégorie
- **Couleurs** : Vert, Orange, Rouge
- **Données** : Incidents par statut

### **3. Graphique en Barres (Réponses)**
- **Type** : `bar`
- **Utilisation** : Comparaison de valeurs
- **Couleurs** : Vert, Rouge, Orange
- **Données** : Réponses par statut

## 🎨 Personnalisation des Couleurs

### **Palette de Couleurs**
```typescript
const colors = {
  blue: '#3b82f6',      // Transactions
  red: '#ef4444',       // Incidents
  green: '#22c55e',     // Succès
  orange: '#f97316',    // Avertissements
  purple: '#8b5cf6',    // Comptes
  teal: '#14b8a6'       // Cartes
};
```

### **Application des Couleurs**
```typescript
datasets: [{
  borderColor: '#3b82f6',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  fill: true
}]
```

## 🔧 Configuration des Graphiques

### **Options de Base**
```typescript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Titre du Graphique'
    },
    legend: {
      display: true,
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
```

### **Options Avancées**
```typescript
const advancedOptions = {
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  },
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white'
    }
  }
};
```

## 📊 Données Dynamiques

### **Structure des Données**
```typescript
interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}
```

### **Exemple d'Intégration**
```typescript
// Dans le service
getTransactionData(): Observable<ChartData> {
  return this.http.get<any[]>('/api/transactions/stats').pipe(
    map(data => ({
      labels: data.map(item => item.date),
      datasets: [{
        label: 'Transactions',
        data: data.map(item => item.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      }]
    }))
  );
}
```

## 🎯 Utilisation dans les Composants

### **1. Création du Graphique**
```typescript
ngAfterViewInit(): void {
  this.createChart();
}

createChart(): void {
  const ctx = document.getElementById('myChart') as HTMLCanvasElement;
  if (!ctx) return;

  const chart = new Chart(ctx, {
    type: 'line',
    data: this.chartData,
    options: this.chartOptions
  });
}
```

### **2. Mise à Jour des Données**
```typescript
updateChart(newData: ChartData): void {
  if (this.chart) {
    this.chart.data = newData;
    this.chart.update();
  }
}
```

### **3. Destruction du Graphique**
```typescript
ngOnDestroy(): void {
  if (this.chart) {
    this.chart.destroy();
  }
}
```

## 📱 Responsive Design

### **Configuration Responsive**
```typescript
const responsiveOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: window.innerWidth > 768
    }
  }
};
```

### **CSS Responsive**
```scss
.chart-container {
  position: relative;
  height: 300px;
  
  @media (max-width: 768px) {
    height: 200px;
  }
}
```

## 🔄 Mise à Jour en Temps Réel

### **Polling Automatique**
```typescript
interval(30000).pipe(
  switchMap(() => this.chartService.getData())
).subscribe(data => {
  this.updateChart(data);
});
```

### **WebSocket Integration**
```typescript
this.websocketService.connect('ws://localhost:8088/ws/charts')
  .subscribe(data => {
    this.updateChart(data);
  });
```

## 🎨 Thèmes et Styles

### **Thème Sombre**
```typescript
const darkTheme = {
  plugins: {
    legend: {
      labels: {
        color: '#ffffff'
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#ffffff'
      },
      grid: {
        color: '#374151'
      }
    },
    y: {
      ticks: {
        color: '#ffffff'
      },
      grid: {
        color: '#374151'
      }
    }
  }
};
```

### **Thème Clair**
```typescript
const lightTheme = {
  plugins: {
    legend: {
      labels: {
        color: '#374151'
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#6b7280'
      },
      grid: {
        color: '#e5e7eb'
      }
    },
    y: {
      ticks: {
        color: '#6b7280'
      },
      grid: {
        color: '#e5e7eb'
      }
    }
  }
};
```

## 🧪 Tests et Debugging

### **Test de Création**
```typescript
testChartCreation(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const chart = new Chart(canvas, {
      type: 'line',
      data: { labels: [], datasets: [] }
    });
    return true;
  } catch (error) {
    console.error('Erreur de création:', error);
    return false;
  }
}
```

### **Debugging des Données**
```typescript
console.log('Données du graphique:', this.chartData);
console.log('Options du graphique:', this.chartOptions);
console.log('Instance du graphique:', this.chart);
```

## 🚀 Optimisations

### **Performance**
```typescript
// Désactiver les animations pour de grandes quantités de données
const performanceOptions = {
  animation: false,
  responsiveAnimationDuration: 0
};
```

### **Mémoire**
```typescript
// Nettoyer les graphiques
ngOnDestroy(): void {
  this.charts.forEach(chart => chart.destroy());
  this.charts = [];
}
```

## 📋 Checklist d'Implémentation

- [ ] **Chart.js installé**
- [ ] **Types importés**
- [ ] **Canvas créé dans le template**
- [ ] **Données formatées**
- [ ] **Options configurées**
- [ ] **Graphique créé dans ngAfterViewInit**
- [ ] **Graphique détruit dans ngOnDestroy**
- [ ] **Responsive design testé**
- [ ] **Erreurs gérées**
- [ ] **Performance optimisée**

## 🎯 Prochaines Étapes

1. **Graphiques Avancés** : Heatmaps, Scatter plots
2. **Interactivité** : Zoom, pan, filtres
3. **Export** : PNG, PDF, CSV
4. **Animations** : Transitions fluides
5. **Accessibilité** : Support lecteur d'écran

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la console pour les erreurs
2. Testez avec des données statiques
3. Vérifiez la version de Chart.js
4. Consultez la documentation officielle

Les graphiques sont maintenant prêts à être utilisés ! 🎉 