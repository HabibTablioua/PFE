// Script pour tester le nouveau bloc des cartes bancaires
console.log('=== Test du Nouveau Bloc Cartes Bancaires ===\n');

async function testCardsBlock() {
  try {
    console.log('🔍 Test de l\'endpoint /api/cards/count...');
    
    const token = localStorage.getItem('token');
    console.log('🔐 Token présent:', !!token);
    
    // Test du nombre de cartes bancaires
    const cardsResponse = await fetch('http://localhost:8088/api/cards/count', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (cardsResponse.ok) {
      const cardsCount = await cardsResponse.json();
      console.log(`💳 Nombre de cartes bancaires: ${cardsCount}`);
      
      if (cardsCount === 0) {
        console.log('⚠️  Aucune carte bancaire trouvée dans la base de données');
      } else {
        console.log(`✅ ${cardsCount} carte(s) bancaire(s) trouvée(s)`);
      }
    } else {
      console.log(`❌ Erreur cartes bancaires: ${cardsResponse.status}`);
      const errorText = await cardsResponse.text();
      console.log(`📝 Détails: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Test de toutes les cartes bancaires avec détails
async function testAllCards() {
  try {
    console.log('\n🔍 Test de toutes les cartes bancaires...');
    
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8088/api/cards', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const cards = await response.json();
      console.log(`📋 Liste des cartes bancaires (${cards.length} total):`);
      
      cards.forEach((card, index) => {
        const status = card.status || 'UNKNOWN';
        const type = card.type || 'UNKNOWN';
        const issuer = card.issuer || 'UNKNOWN';
        const statusIcon = status === 'ACTIVE' ? '🟢' : '🔴';
        
        console.log(`   ${index + 1}. ${card.pan} (${card.holderName})`);
        console.log(`      🏦 Émetteur: ${issuer}`);
        console.log(`      📊 Statut: ${statusIcon} ${status}`);
        console.log(`      💳 Type: ${type}`);
        console.log(`      📅 Expiration: ${card.expiryDate}`);
        console.log('');
      });
      
      console.log(`\n📊 Résumé des cartes bancaires:`);
      console.log(`   💳 Total cartes: ${cards.length}`);
      
      // Compter par statut
      const statusCount = {};
      cards.forEach(card => {
        const status = card.status || 'UNKNOWN';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
      
      // Compter par type
      const typeCount = {};
      cards.forEach(card => {
        const type = card.type || 'UNKNOWN';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      
      console.log(`\n💳 Répartition par type:`);
      Object.entries(typeCount).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
      
    } else {
      console.log(`❌ Erreur HTTP: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Test des cartes actives et bloquées
async function testCardStatus() {
  try {
    console.log('\n🔍 Test des cartes par statut...');
    
    const token = localStorage.getItem('token');
    
    // Test des cartes actives
    const activeResponse = await fetch('http://localhost:8088/api/cards/count/active', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Test des cartes bloquées
    const blockedResponse = await fetch('http://localhost:8088/api/cards/count/blocked', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (activeResponse.ok && blockedResponse.ok) {
      const activeCount = await activeResponse.json();
      const blockedCount = await blockedResponse.json();
      
      console.log(`📊 Statut des cartes:`);
      console.log(`   🟢 Actives: ${activeCount}`);
      console.log(`   🔴 Bloquées: ${blockedCount}`);
      console.log(`   📊 Total: ${activeCount + blockedCount}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur de test des statuts:', error.message);
  }
}

// Test du dashboard complet avec le nouveau bloc
async function testDashboardWithCards() {
  try {
    console.log('\n🔍 Test du dashboard avec le nouveau bloc cartes...');
    
    const token = localStorage.getItem('token');
    
    // Test de tous les endpoints du dashboard
    const endpoints = [
      { name: 'Transactions', url: 'http://localhost:8088/api/history/count' },
      { name: 'Incidents', url: 'http://localhost:8088/api/incidents/count' },
      { name: 'Réponses ISO', url: 'http://localhost:8088/api/response/history/count-success' },
      { name: 'Comptes Bancaires', url: 'http://localhost:8088/api/accounts/count' },
      { name: 'Cartes Bancaires', url: 'http://localhost:8088/api/cards/count' },
      { name: 'Utilisateurs', url: 'http://localhost:8088/api/users/count' }
    ];
    
    console.log('📊 Statistiques du dashboard (6 blocs):');
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const count = await response.json();
          console.log(`   ${endpoint.name}: ${count}`);
        } else {
          console.log(`   ${endpoint.name}: ❌ Erreur ${response.status}`);
        }
      } catch (error) {
        console.log(`   ${endpoint.name}: ❌ Erreur de connexion`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur de test du dashboard:', error.message);
  }
}

// Exécuter les tests
testCardsBlock().then(() => {
  testAllCards().then(() => {
    testCardStatus().then(() => {
      testDashboardWithCards();
    });
  });
});

console.log('\n=== Instructions ===');
console.log('1. Ouvrez la console du navigateur (F12)');
console.log('2. Copiez-collez ce script');
console.log('3. Vérifiez les résultats');
console.log('4. Vérifiez que le nouveau bloc teal apparaît sur le dashboard');
console.log('\n=== Note ===');
console.log('Le dashboard devrait maintenant avoir 6 blocs au lieu de 5');
console.log('Le nouveau bloc "Cartes Bancaires" devrait être teal'); 