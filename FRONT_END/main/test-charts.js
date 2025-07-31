const { Chart } = require('chart.js');

console.log('🧪 Test des graphiques Chart.js');

// Test de création d'un graphique simple
function testChartCreation() {
  console.log('📊 Test de création de graphique...');
  
  // Simuler un canvas
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  
  try {
    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [{
          label: 'Transactions',
          data: [65, 59, 80, 81, 56, 55, 40],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Test Graphique'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    console.log('✅ Graphique créé avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création du graphique:', error);
    return false;
  }
}

// Test des données de graphiques
function testChartData() {
  console.log('📈 Test des données de graphiques...');
  
  const testData = {
    transactions: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Transactions',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      }]
    },
    incidents: {
      labels: ['Résolus', 'En cours', 'Non traités'],
      datasets: [{
        data: [70, 20, 10],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444']
      }]
    },
    responses: {
      labels: ['Succès', 'Échec', 'En cours'],
      datasets: [{
        label: 'Réponses',
        data: [85, 10, 5],
        backgroundColor: ['#22c55e', '#ef4444', '#f59e0b']
      }]
    }
  };
  
  console.log('✅ Données de test créées:', testData);
  return testData;
}

// Test des couleurs
function testColors() {
  console.log('🎨 Test des couleurs...');
  
  const colors = {
    blue: '#3b82f6',
    red: '#ef4444',
    green: '#22c55e',
    orange: '#f97316',
    purple: '#8b5cf6',
    teal: '#14b8a6'
  };
  
  console.log('✅ Couleurs définies:', colors);
  return colors;
}

// Test des types de graphiques
function testChartTypes() {
  console.log('📊 Test des types de graphiques...');
  
  const chartTypes = [
    'line',
    'bar',
    'doughnut',
    'pie',
    'radar',
    'polarArea'
  ];
  
  console.log('✅ Types de graphiques supportés:', chartTypes);
  return chartTypes;
}

// Test complet
function runAllTests() {
  console.log('🚀 Démarrage des tests de graphiques...\n');
  
  const results = {
    chartCreation: testChartCreation(),
    chartData: testChartData(),
    colors: testColors(),
    chartTypes: testChartTypes()
  };
  
  console.log('\n📋 Résultats des tests:');
  console.log('✅ Création de graphique:', results.chartCreation ? 'SUCCÈS' : 'ÉCHEC');
  console.log('✅ Données de graphique:', results.chartData ? 'SUCCÈS' : 'ÉCHEC');
  console.log('✅ Couleurs:', results.colors ? 'SUCCÈS' : 'ÉCHEC');
  console.log('✅ Types de graphiques:', results.chartTypes ? 'SUCCÈS' : 'ÉCHEC');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 Tous les tests sont passés ! Les graphiques sont prêts.');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez la configuration.');
  }
  
  return allPassed;
}

// Exécuter les tests si le script est appelé directement
if (typeof window !== 'undefined') {
  // Dans le navigateur
  window.testCharts = runAllTests;
  console.log('🧪 Tests de graphiques chargés. Appelez testCharts() pour les exécuter.');
} else {
  // Dans Node.js
  runAllTests();
}

module.exports = {
  testChartCreation,
  testChartData,
  testColors,
  testChartTypes,
  runAllTests
}; 