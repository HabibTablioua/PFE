# 🔧 Dépannage des Graphiques

## 🚨 Problèmes Courants et Solutions

### **1. Graphiques ne s'affichent pas**

#### **Symptômes :**
- Canvas vide
- Erreur dans la console
- Graphiques non visibles

#### **Solutions :**

**A. Vérifier l'installation de Chart.js**
```bash
npm list chart.js
npm install chart.js @types/chart.js --save
```

**B. Vérifier les imports**
```typescript
// Dans le composant
import { Chart } from 'chart.js';

// Dans angular.json (si nécessaire)
"scripts": [
  "node_modules/chart.js/dist/chart.js"
]
```

**C. Vérifier le canvas**
```html
<!-- Dans le template -->
<canvas id="transactionChart" width="400" height="300"></canvas>
```

**D. Vérifier la création du graphique**
```typescript
createChart(): void {
  const ctx = document.getElementById('transactionChart') as HTMLCanvasElement;
  if (!ctx) {
    console.error('Canvas non trouvé');
    return;
  }
  
  console.log('Canvas trouvé:', ctx);
  
  try {
    const chart = new Chart(ctx, {
      // configuration...
    });
    console.log('Graphique créé:', chart);
  } catch (error) {
    console.error('Erreur création graphique:', error);
  }
}
```

### **2. Erreur "Chart is not defined"**

#### **Solution :**
```typescript
// Vérifier l'import
import { Chart } from 'chart.js';

// Ou utiliser l'import global
declare const Chart: any;
```

### **3. Graphiques ne se mettent pas à jour**

#### **Solutions :**

**A. Forcer la mise à jour**
```typescript
updateChart(): void {
  if (this.chart) {
    this.chart.data = newData;
    this.chart.update('active'); // Animation
    // ou
    this.chart.update('none'); // Sans animation
  }
}
```

**B. Détruire et recréer**
```typescript
refreshChart(): void {
  if (this.chart) {
    this.chart.destroy();
  }
  this.createChart();
}
```

### **4. Problèmes de responsive**

#### **Solutions :**

**A. Configuration responsive**
```typescript
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: window.innerWidth > 768
    }
  }
};
```

**B. CSS responsive**
```scss
.chart-container {
  position: relative;
  height: 300px;
  
  @media (max-width: 768px) {
    height: 200px;
  }
}
```

### **5. Erreurs de données**

#### **Solutions :**

**A. Vérifier le format des données**
```typescript
// Format correct
const data = {
  labels: ['Lun', 'Mar', 'Mer'],
  datasets: [{
    label: 'Transactions',
    data: [10, 20, 30]
  }]
};
```

**B. Validation des données**
```typescript
validateChartData(data: any): boolean {
  if (!data || !data.labels || !data.datasets) {
    console.error('Données invalides');
    return false;
  }
  
  if (data.labels.length !== data.datasets[0].data.length) {
    console.error('Labels et données ne correspondent pas');
    return false;
  }
  
  return true;
}
```

### **6. Problèmes de performance**

#### **Solutions :**

**A. Désactiver les animations**
```typescript
const options = {
  animation: false,
  responsiveAnimationDuration: 0
};
```

**B. Limiter les données**
```typescript
// Limiter à 100 points maximum
const limitedData = data.slice(-100);
```

**C. Nettoyer la mémoire**
```typescript
ngOnDestroy(): void {
  if (this.chart) {
    this.chart.destroy();
    this.chart = null;
  }
}
```

## 🔍 Diagnostic

### **1. Vérifier la Console**
```javascript
// Dans la console du navigateur
console.log('Chart.js version:', Chart.version);
console.log('Canvas elements:', document.querySelectorAll('canvas'));
```

### **2. Test de Base**
```javascript
// Test simple dans la console
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{
      label: 'Test',
      data: [1, 2, 3]
    }]
  }
});
```

### **3. Vérifier les Dépendances**
```bash
npm list chart.js
npm list @types/chart.js
```

## 🛠️ Outils de Debug

### **1. Script de Test**
```javascript
// test-charts.js
function testChartCreation() {
  try {
    const canvas = document.createElement('canvas');
    const chart = new Chart(canvas, {
      type: 'line',
      data: { labels: [], datasets: [] }
    });
    console.log('✅ Chart.js fonctionne');
    return true;
  } catch (error) {
    console.error('❌ Erreur Chart.js:', error);
    return false;
  }
}
```

### **2. Vérification des Données**
```typescript
logChartData(data: any): void {
  console.log('📊 Données du graphique:');
  console.log('Labels:', data.labels);
  console.log('Datasets:', data.datasets);
  console.log('Options:', data.options);
}
```

## 📋 Checklist de Dépannage

- [ ] **Chart.js installé**
- [ ] **Types importés correctement**
- [ ] **Canvas présent dans le DOM**
- [ ] **Données au bon format**
- [ ] **Options valides**
- [ ] **Pas d'erreurs dans la console**
- [ ] **Graphique créé après ngAfterViewInit**
- [ ] **Responsive design testé**
- [ ] **Mémoire nettoyée**

## 🚀 Solutions Rapides

### **1. Redémarrer l'application**
```bash
npm start
```

### **2. Nettoyer le cache**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### **3. Vérifier les versions**
```bash
npm outdated
npm update
```

### **4. Test minimal**
```typescript
// Test minimal dans le composant
ngAfterViewInit(): void {
  setTimeout(() => {
    const ctx = document.getElementById('testChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Test'],
          datasets: [{ data: [1] }]
        }
      });
    }
  }, 100);
}
```

## 📞 Support Avancé

Si les problèmes persistent :

1. **Vérifier la version d'Angular**
2. **Vérifier la version de Chart.js**
3. **Tester avec des données statiques**
4. **Vérifier les conflits CSS**
5. **Consulter la documentation Chart.js**

## 🎯 Prochaines Étapes

Une fois les graphiques fonctionnels :

1. **Ajouter des interactions** (click, hover)
2. **Implémenter des filtres**
3. **Ajouter des animations**
4. **Optimiser les performances**
5. **Ajouter des exports**

Les graphiques devraient maintenant s'afficher correctement ! 🎉 