// Script pour tester le nouveau bloc des comptes bancaires
console.log('=== Test du Nouveau Bloc Comptes Bancaires ===\n');

async function testBankAccountsBlock() {
  try {
    console.log('🔍 Test de l\'endpoint /api/accounts/count...');
    
    const token = localStorage.getItem('token');
    console.log('🔐 Token présent:', !!token);
    
    // Test du nombre de comptes bancaires
    const accountsResponse = await fetch('http://localhost:8088/api/accounts/count', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (accountsResponse.ok) {
      const bankAccountsCount = await accountsResponse.json();
      console.log(`💳 Nombre de comptes bancaires: ${bankAccountsCount}`);
      
      if (bankAccountsCount === 0) {
        console.log('⚠️  Aucun compte bancaire trouvé dans la base de données');
      } else {
        console.log(`✅ ${bankAccountsCount} compte(s) bancaire(s) trouvé(s)`);
      }
    } else {
      console.log(`❌ Erreur comptes bancaires: ${accountsResponse.status}`);
      const errorText = await accountsResponse.text();
      console.log(`📝 Détails: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Test de tous les comptes bancaires avec détails
async function testAllBankAccounts() {
  try {
    console.log('\n🔍 Test de tous les comptes bancaires...');
    
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8088/api/accounts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const accounts = await response.json();
      console.log(`📋 Liste des comptes bancaires (${accounts.length} total):`);
      
      accounts.forEach((account, index) => {
        const status = account.status || 'UNKNOWN';
        const type = account.type || 'UNKNOWN';
        const balance = account.balance || 0;
        const currency = account.currency || 'MAD';
        const statusIcon = status === 'OPEN' ? '🟢' : '🔴';
        
        console.log(`   ${index + 1}. ${account.pan} (${account.holderName})`);
        console.log(`      💰 Solde: ${balance} ${currency}`);
        console.log(`      📊 Statut: ${statusIcon} ${status}`);
        console.log(`      🏦 Type: ${type}`);
        console.log(`      📧 Email: ${account.email}`);
        console.log('');
      });
      
      console.log(`\n📊 Résumé des comptes bancaires:`);
      console.log(`   💳 Total comptes: ${accounts.length}`);
      
      // Compter par statut
      const statusCount = {};
      accounts.forEach(account => {
        const status = account.status || 'UNKNOWN';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
      
      // Compter par type
      const typeCount = {};
      accounts.forEach(account => {
        const type = account.type || 'UNKNOWN';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      
      console.log(`\n🏦 Répartition par type:`);
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

// Test du dashboard complet
async function testDashboardStats() {
  try {
    console.log('\n🔍 Test des statistiques du dashboard...');
    
    const token = localStorage.getItem('token');
    
    // Test de tous les endpoints du dashboard
    const endpoints = [
      { name: 'Transactions', url: 'http://localhost:8088/api/history/count' },
      { name: 'Incidents', url: 'http://localhost:8088/api/incidents/count' },
      { name: 'Réponses ISO', url: 'http://localhost:8088/api/response/history/count-success' },
      { name: 'Comptes Bancaires', url: 'http://localhost:8088/api/accounts/count' },
      { name: 'Utilisateurs', url: 'http://localhost:8088/api/users/count' }
    ];
    
    console.log('📊 Statistiques du dashboard:');
    
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
testBankAccountsBlock().then(() => {
  testAllBankAccounts().then(() => {
    testDashboardStats();
  });
});

console.log('\n=== Instructions ===');
console.log('1. Ouvrez la console du navigateur (F12)');
console.log('2. Copiez-collez ce script');
console.log('3. Vérifiez les résultats');
console.log('4. Vérifiez que le nouveau bloc violet apparaît sur le dashboard');
console.log('\n=== Note ===');
console.log('Le dashboard devrait maintenant avoir 5 blocs au lieu de 4');
console.log('Le nouveau bloc "Comptes Bancaires" devrait être violet'); 