// Test de la disposition horizontale des graphiques
console.log('🧪 Test de la disposition horizontale des graphiques');

// Fonction pour vérifier la disposition
function testHorizontalLayout() {
  console.log('📊 Vérification de la disposition...');
  
  // Vérifier si les éléments existent
  const chartsGrid = document.querySelector('.charts-grid');
  const chartCards = document.querySelectorAll('.chart-card');
  
  if (!chartsGrid) {
    console.error('❌ .charts-grid non trouvé');
    return false;
  }
  
  if (chartCards.length !== 2) {
    console.error(`❌ Nombre de graphiques incorrect: ${chartCards.length} (attendu: 2)`);
    return false;
  }
  
  // Vérifier les styles CSS
  const computedStyle = window.getComputedStyle(chartsGrid);
  const display = computedStyle.display;
  const flexDirection = computedStyle.flexDirection;
  
  console.log('📋 Styles CSS détectés:');
  console.log('- display:', display);
  console.log('- flex-direction:', flexDirection);
  
  if (display !== 'flex') {
    console.error('❌ display n\'est pas flex');
    return false;
  }
  
  if (flexDirection !== 'row') {
    console.error('❌ flex-direction n\'est pas row');
    return false;
  }
  
  // Vérifier la largeur des cartes
  const firstCard = chartCards[0];
  const secondCard = chartCards[1];
  
  const firstCardStyle = window.getComputedStyle(firstCard);
  const secondCardStyle = window.getComputedStyle(secondCard);
  
  console.log('📏 Largeurs des cartes:');
  console.log('- Première carte:', firstCardStyle.width);
  console.log('- Deuxième carte:', secondCardStyle.width);
  
  // Vérifier que les cartes sont côte à côte
  const firstCardRect = firstCard.getBoundingClientRect();
  const secondCardRect = secondCard.getBoundingClientRect();
  
  console.log('📍 Positions des cartes:');
  console.log('- Première carte:', firstCardRect.left, firstCardRect.top);
  console.log('- Deuxième carte:', secondCardRect.left, secondCardRect.top);
  
  // Vérifier qu'elles sont sur la même ligne (même top)
  const topDifference = Math.abs(firstCardRect.top - secondCardRect.top);
  if (topDifference > 10) {
    console.error('❌ Les cartes ne sont pas sur la même ligne');
    return false;
  }
  
  // Vérifier qu'elles sont côte à côte (deuxième à droite de la première)
  if (secondCardRect.left <= firstCardRect.right) {
    console.error('❌ Les cartes ne sont pas côte à côte');
    return false;
  }
  
  console.log('✅ Disposition horizontale correcte !');
  return true;
}

// Fonction pour tester le responsive
function testResponsiveLayout() {
  console.log('📱 Test du responsive...');
  
  const chartsGrid = document.querySelector('.charts-grid');
  if (!chartsGrid) return false;
  
  // Simuler une taille mobile
  const originalWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 600
  });
  
  // Déclencher un resize event
  window.dispatchEvent(new Event('resize'));
  
  setTimeout(() => {
    const computedStyle = window.getComputedStyle(chartsGrid);
    const flexDirection = computedStyle.flexDirection;
    
    console.log('📱 Flex-direction sur mobile:', flexDirection);
    
    if (flexDirection === 'column') {
      console.log('✅ Responsive mobile correct !');
    } else {
      console.log('❌ Responsive mobile incorrect');
    }
    
    // Restaurer la taille originale
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth
    });
    
    window.dispatchEvent(new Event('resize'));
  }, 100);
}

// Fonction principale
function runLayoutTests() {
  console.log('🚀 Démarrage des tests de disposition...\n');
  
  const results = {
    horizontal: testHorizontalLayout(),
    responsive: testResponsiveLayout()
  };
  
  console.log('\n📋 Résultats des tests:');
  console.log('✅ Disposition horizontale:', results.horizontal ? 'SUCCÈS' : 'ÉCHEC');
  console.log('✅ Responsive design:', results.responsive ? 'SUCCÈS' : 'ÉCHEC');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 Tous les tests sont passés ! La disposition est correcte.');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez la configuration.');
  }
  
  return allPassed;
}

// Exposer les fonctions globalement
window.testHorizontalLayout = testHorizontalLayout;
window.testResponsiveLayout = testResponsiveLayout;
window.runLayoutTests = runLayoutTests;

console.log('🧪 Tests de disposition chargés. Appelez runLayoutTests() pour les exécuter.'); 